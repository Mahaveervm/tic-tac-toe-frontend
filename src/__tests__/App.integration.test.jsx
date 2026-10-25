import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

vi.mock('../api/gameApi', async () => {
  const { createMockApi } = await import('../api/mockApi');
  return { gameApi: createMockApi({ latency: 0 }) };
});

const status = () => screen.getByTestId('status-message');
const cell = (i) => screen.getByTestId(`cell-${i}`);
const click = async (i, expected) => {
  fireEvent.click(cell(i));
  await waitFor(() => expect(status()).toHaveTextContent(expected));
};

describe('App end-to-end with mock backend', () => {
  it('plays a full two player game, scores once, resets game and scoreboard', async () => {
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    await click(0, "Player O's turn");
    await click(3, "Player X's turn");
    await click(1, "Player O's turn");
    fireEvent.click(screen.getByText('Undo Last Move'));
    await waitFor(() => expect(cell(1)).toHaveTextContent(''));
    expect(status()).toHaveTextContent("Player X's turn");
    await click(1, "Player O's turn");
    await click(4, "Player X's turn");
    await click(2, 'Player X wins!');
    expect(cell(0)).toHaveClass('cell--win');
    expect(cell(1)).toHaveClass('cell--win');
    expect(cell(2)).toHaveClass('cell--win');
    expect(cell(8)).toBeDisabled();
    expect(screen.getByText('Undo Last Move')).toBeDisabled();
    expect(screen.getByTestId('score-x')).toHaveTextContent('1');
    expect(screen.getAllByRole('row')).toHaveLength(6);

    fireEvent.click(screen.getByText('Reset Game'));
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    expect(screen.getByText('No moves yet.')).toBeInTheDocument();
    expect(cell(0)).toHaveTextContent('');
    expect(screen.getByTestId('score-x')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Reset Scoreboard'));
    await waitFor(() => expect(screen.getByTestId('score-x')).toHaveTextContent('0'));
  });

  it('plays against the computer with pair undo', async () => {
    render(<App />);
    await waitFor(() => expect(status()).toHaveTextContent("Player X's turn"));
    fireEvent.click(screen.getByRole('radio', { name: 'Play Against Computer' }));
    await waitFor(() =>
      expect(screen.getByTestId('selected-mode')).toHaveTextContent('Play Against Computer')
    );
    fireEvent.click(cell(0));
    await waitFor(() => expect(cell(4)).toHaveTextContent('O'));
    expect(status()).toHaveTextContent("Player X's turn");
    fireEvent.click(cell(1));
    await waitFor(() => expect(cell(2)).toHaveTextContent('O'));
    fireEvent.click(screen.getByText('Undo Last Move'));
    await waitFor(() => expect(cell(2)).toHaveTextContent(''));
    expect(cell(1)).toHaveTextContent('');
    expect(cell(0)).toHaveTextContent('X');
    expect(cell(4)).toHaveTextContent('O');
    fireEvent.click(cell(1));
    await waitFor(() => expect(cell(2)).toHaveTextContent('O'));
    fireEvent.click(cell(8));
    await waitFor(() => expect(status()).toHaveTextContent('Computer (O) wins!'));
    expect(screen.getByTestId('score-o')).toHaveTextContent('1');
    expect(cell(5)).toBeDisabled();
  });
});
