import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { gameApi } from '../api/gameApi';

vi.mock('../api/gameApi', () => ({
  gameApi: {
    createGame: vi.fn(),
    getGame: vi.fn(),
    makeMove: vi.fn(),
    undo: vi.fn(),
    reset: vi.fn(),
    getScoreboard: vi.fn(),
    resetScoreboard: vi.fn()
  }
}));

const baseGame = {
  id: 'g1',
  board: Array(9).fill(null),
  currentPlayer: 'X',
  mode: 'TwoPlayer',
  status: 'InProgress',
  winner: null,
  winningCells: [],
  moves: [],
  scoreboard: { xWins: 0, oWins: 0, draws: 0 }
};

const status = () => screen.getByTestId('status-message');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gameApi.createGame.mockResolvedValue(baseGame);
  });

  it('creates a game on load and shows current turn and mode', async () => {
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    expect(gameApi.createGame).toHaveBeenCalledWith('TwoPlayer');
    expect(screen.getByTestId('selected-mode')).toHaveTextContent('Two Player Mode');
  });

  it('submits a move and renders backend state', async () => {
    gameApi.makeMove.mockResolvedValue({
      ...baseGame,
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      moves: [{ moveNumber: 1, player: 'X', row: 0, col: 0 }]
    });
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByTestId('cell-0'));
    expect(gameApi.makeMove).toHaveBeenCalledWith('g1', 'X', 0, 0);
    await waitFor(() => expect(status()).toHaveTextContent("Player O's turn"));
    expect(screen.getByTestId('cell-0')).toHaveTextContent('X');
    expect(screen.getByTestId('cell-0')).toBeDisabled();
    expect(screen.getByText('Row 1, Column 1')).toBeInTheDocument();
    expect(screen.getByText('Undo Last Move')).not.toBeDisabled();
  });

  it('disables undo when no moves', async () => {
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    expect(screen.getByText('Undo Last Move')).toBeDisabled();
  });

  it('shows winner, highlights cells and disables undo after completion', async () => {
    gameApi.makeMove.mockResolvedValue({
      ...baseGame,
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      status: 'Won',
      winner: 'X',
      winningCells: [0, 1, 2],
      moves: [
        { moveNumber: 1, player: 'X', row: 0, col: 0 },
        { moveNumber: 2, player: 'O', row: 1, col: 0 },
        { moveNumber: 3, player: 'X', row: 0, col: 1 },
        { moveNumber: 4, player: 'O', row: 1, col: 1 },
        { moveNumber: 5, player: 'X', row: 0, col: 2 }
      ],
      scoreboard: { xWins: 1, oWins: 0, draws: 0 }
    });
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByTestId('cell-2'));
    await waitFor(() => expect(status()).toHaveTextContent('Player X wins!'));
    expect(screen.getByTestId('cell-0')).toHaveClass('cell--win');
    expect(screen.getByTestId('cell-3')).not.toHaveClass('cell--win');
    expect(screen.getByTestId('score-x')).toHaveTextContent('1');
    expect(screen.getByText('Undo Last Move')).toBeDisabled();
    expect(screen.getByTestId('cell-5')).toBeDisabled();
  });

  it('shows draw message', async () => {
    gameApi.makeMove.mockResolvedValue({
      ...baseGame,
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
      status: 'Draw',
      scoreboard: { xWins: 0, oWins: 0, draws: 1 }
    });
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByTestId('cell-8'));
    await waitFor(() => expect(status()).toHaveTextContent("It's a draw!"));
    expect(screen.getByTestId('score-draws')).toHaveTextContent('1');
  });

  it('calls undo and reset endpoints', async () => {
    gameApi.makeMove.mockResolvedValue({
      ...baseGame,
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      moves: [{ moveNumber: 1, player: 'X', row: 0, col: 0 }]
    });
    gameApi.undo.mockResolvedValue(baseGame);
    gameApi.reset.mockResolvedValue(baseGame);
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByTestId('cell-0'));
    await waitFor(() => expect(status()).toHaveTextContent("Player O's turn"));
    fireEvent.click(screen.getByText('Undo Last Move'));
    await waitFor(() => expect(gameApi.undo).toHaveBeenCalledWith('g1'));
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByText('Reset Game'));
    await waitFor(() => expect(gameApi.reset).toHaveBeenCalledWith('g1'));
    expect(screen.getByText('No moves yet.')).toBeInTheDocument();
  });

  it('switches to computer mode and creates a new game', async () => {
    gameApi.createGame.mockImplementation((mode) => Promise.resolve({ ...baseGame, mode }));
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByRole('radio', { name: 'Play Against Computer' }));
    await waitFor(() => expect(gameApi.createGame).toHaveBeenLastCalledWith('Computer'));
    await waitFor(() =>
      expect(screen.getByTestId('selected-mode')).toHaveTextContent('Play Against Computer')
    );
    expect(screen.getByRole('radio', { name: 'Play Against Computer' })).toHaveAttribute('aria-checked', 'true');
  });

  it('resets scoreboard', async () => {
    gameApi.createGame.mockResolvedValue({ ...baseGame, scoreboard: { xWins: 3, oWins: 2, draws: 1 } });
    gameApi.resetScoreboard.mockResolvedValue({ xWins: 0, oWins: 0, draws: 0 });
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('score-x')).toHaveTextContent('3'));
    fireEvent.click(screen.getByText('Reset Scoreboard'));
    await waitFor(() => expect(screen.getByTestId('score-x')).toHaveTextContent('0'));
    expect(screen.getByTestId('score-o')).toHaveTextContent('0');
    expect(screen.getByTestId('score-draws')).toHaveTextContent('0');
  });

  it('shows backend error for invalid move and keeps the turn', async () => {
    gameApi.makeMove.mockRejectedValue(new Error('Cell is already occupied'));
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByTestId('cell-4'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cell is already occupied');
    expect(status()).toHaveTextContent("Player X's turn");
  });
});
