import {
  GAME_MODES,
  GAME_STATUS,
  applyMove,
  chooseComputerMove,
  createEmptyScoreboard,
  createGameState,
  evaluateStatus,
  resetGameState,
  undoMove,
  updateScoreboard
} from '../utils/gameLogic';

const play = (game, moves) => {
  moves.forEach(([player, row, col]) => applyMove(game, player, row, col));
  return game;
};

const boardFrom = (str) => str.split('').map((c) => (c === '.' ? null : c));

describe('game logic', () => {
  let game;

  beforeEach(() => {
    game = createGameState('g1', GAME_MODES.TWO_PLAYER);
  });

  it('creates a new game with empty board and X to play', () => {
    expect(game.board).toEqual(Array(9).fill(null));
    expect(game.currentPlayer).toBe('X');
    expect(game.status).toBe(GAME_STATUS.IN_PROGRESS);
    expect(game.moves).toEqual([]);
  });

  it('applies a valid move', () => {
    applyMove(game, 'X', 0, 0);
    expect(game.board[0]).toBe('X');
    expect(game.moves).toEqual([{ moveNumber: 1, player: 'X', row: 0, col: 0 }]);
  });

  it('switches turns after a valid move', () => {
    applyMove(game, 'X', 0, 0);
    expect(game.currentPlayer).toBe('O');
    applyMove(game, 'O', 1, 1);
    expect(game.currentPlayer).toBe('X');
  });

  it('rejects a move on an occupied cell without changing turn', () => {
    applyMove(game, 'X', 0, 0);
    expect(() => applyMove(game, 'O', 0, 0)).toThrow('Cell is already occupied');
    expect(game.currentPlayer).toBe('O');
    expect(game.moves).toHaveLength(1);
  });

  it('rejects a move outside the board', () => {
    expect(() => applyMove(game, 'X', 3, 0)).toThrow('Move is outside the board');
    expect(() => applyMove(game, 'X', -1, 2)).toThrow('Move is outside the board');
    expect(game.currentPlayer).toBe('X');
  });

  it('rejects a move by the wrong player', () => {
    expect(() => applyMove(game, 'O', 0, 0)).toThrow("It is X's turn");
    expect(game.board[0]).toBeNull();
  });

  it('detects a row win', () => {
    play(game, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
    expect(game.status).toBe(GAME_STATUS.WON);
    expect(game.winner).toBe('X');
    expect(game.winningCells).toEqual([0, 1, 2]);
  });

  it('detects a column win', () => {
    play(game, [['X', 0, 0], ['O', 0, 1], ['X', 1, 0], ['O', 1, 1], ['X', 2, 2], ['O', 2, 1]]);
    expect(game.status).toBe(GAME_STATUS.WON);
    expect(game.winner).toBe('O');
    expect(game.winningCells).toEqual([1, 4, 7]);
  });

  it('detects a diagonal win', () => {
    play(game, [['X', 0, 0], ['O', 0, 1], ['X', 1, 1], ['O', 0, 2], ['X', 2, 2]]);
    expect(game.winningCells).toEqual([0, 4, 8]);
    expect(evaluateStatus(boardFrom('..X.X.X..')).winningCells).toEqual([2, 4, 6]);
  });

  it('detects a draw', () => {
    play(game, [
      ['X', 0, 0], ['O', 0, 1], ['X', 0, 2],
      ['O', 1, 1], ['X', 1, 0], ['O', 1, 2],
      ['X', 2, 1], ['O', 2, 0], ['X', 2, 2]
    ]);
    expect(game.status).toBe(GAME_STATUS.DRAW);
    expect(game.winner).toBeNull();
  });

  it('rejects a move after game completion', () => {
    play(game, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
    expect(() => applyMove(game, 'O', 2, 2)).toThrow('Game is already completed');
    expect(game.board[8]).toBeNull();
  });

  it('resets the game state', () => {
    play(game, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
    resetGameState(game);
    expect(game.board).toEqual(Array(9).fill(null));
    expect(game.moves).toEqual([]);
    expect(game.status).toBe(GAME_STATUS.IN_PROGRESS);
    expect(game.winner).toBeNull();
    expect(game.winningCells).toEqual([]);
    expect(game.currentPlayer).toBe('X');
    expect(game.mode).toBe(GAME_MODES.TWO_PLAYER);
  });

  it('undoes only the last move in two player mode', () => {
    play(game, [['X', 0, 0], ['O', 1, 1]]);
    undoMove(game);
    expect(game.board[4]).toBeNull();
    expect(game.board[0]).toBe('X');
    expect(game.moves).toHaveLength(1);
    expect(game.currentPlayer).toBe('O');
  });

  it('undoes the computer move and the previous human move in computer mode', () => {
    game = createGameState('g2', GAME_MODES.COMPUTER);
    play(game, [['X', 0, 0], ['O', 1, 1], ['X', 2, 2], ['O', 0, 2]]);
    undoMove(game);
    expect(game.moves).toHaveLength(2);
    expect(game.board[8]).toBeNull();
    expect(game.board[2]).toBeNull();
    expect(game.currentPlayer).toBe('X');
  });

  it('rejects undo with no moves', () => {
    expect(() => undoMove(game)).toThrow('No moves to undo');
  });

  it('rejects undo after game completion', () => {
    play(game, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
    expect(() => undoMove(game)).toThrow('Undo is disabled after the game is completed');
  });

  it('updates the scoreboard only once per completed game', () => {
    let score = createEmptyScoreboard();
    play(game, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
    score = updateScoreboard(score, game);
    score = updateScoreboard(score, game);
    expect(score).toEqual({ xWins: 1, oWins: 0, draws: 0 });
  });

  it('does not update the scoreboard for an in-progress game', () => {
    applyMove(game, 'X', 0, 0);
    expect(updateScoreboard(createEmptyScoreboard(), game)).toEqual(createEmptyScoreboard());
  });

  it('counts draws and O wins on the scoreboard', () => {
    let score = createEmptyScoreboard();
    const draw = createGameState('d', GAME_MODES.TWO_PLAYER);
    play(draw, [
      ['X', 0, 0], ['O', 0, 1], ['X', 0, 2],
      ['O', 1, 1], ['X', 1, 0], ['O', 1, 2],
      ['X', 2, 1], ['O', 2, 0], ['X', 2, 2]
    ]);
    score = updateScoreboard(score, draw);
    play(game, [['X', 0, 0], ['O', 0, 1], ['X', 1, 0], ['O', 1, 1], ['X', 2, 2], ['O', 2, 1]]);
    score = updateScoreboard(score, game);
    expect(score).toEqual({ xWins: 0, oWins: 1, draws: 1 });
  });

  describe('computer move selection', () => {
    it('plays the winning move first', () => {
      expect(chooseComputerMove(boardFrom('OO.XX....'))).toBe(2);
    });

    it('blocks X when O cannot win', () => {
      expect(chooseComputerMove(boardFrom('XX..O....'))).toBe(2);
    });

    it('takes the center when available', () => {
      expect(chooseComputerMove(boardFrom('X........'))).toBe(4);
    });

    it('takes a corner when center is taken', () => {
      expect(chooseComputerMove(boardFrom('....X....'))).toBe(0);
    });

    it('takes any available cell when no corner is free', () => {
      expect(chooseComputerMove(boardFrom('X.OOXXXOO'))).toBe(1);
    });

    it('only chooses empty cells', () => {
      const board = boardFrom('XOX.OXOXO');
      const index = chooseComputerMove(board);
      expect(board[index]).toBeNull();
    });
  });
});
