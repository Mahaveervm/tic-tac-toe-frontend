import { render, screen, fireEvent } from '@testing-library/react';
import Board from '../components/Board';

describe('Board', () => {
  const board = ['X', '', 'O', '', '', '', '', '', ''];

  it('renders 9 cells', () => {
    render(<Board board={board} winningCells={[]} disabled={false} onCellClick={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('displays X and O', () => {
    render(<Board board={board} winningCells={[]} disabled={false} onCellClick={() => {}} />);
    expect(screen.getByTestId('cell-0')).toHaveTextContent('X');
    expect(screen.getByTestId('cell-2')).toHaveTextContent('O');
  });

  it('locks occupied cells', () => {
    render(<Board board={board} winningCells={[]} disabled={false} onCellClick={() => {}} />);
    expect(screen.getByTestId('cell-0')).toBeDisabled();
    expect(screen.getByTestId('cell-1')).not.toBeDisabled();
  });

  it('calls handler with index when empty cell clicked', () => {
    const onClick = vi.fn();
    render(<Board board={board} winningCells={[]} disabled={false} onCellClick={onClick} />);
    fireEvent.click(screen.getByTestId('cell-4'));
    expect(onClick).toHaveBeenCalledWith(4);
  });

  it('highlights winning cells', () => {
    render(
      <Board board={['X', 'X', 'X', 'O', 'O', '', '', '', '']} winningCells={[0, 1, 2]} disabled onCellClick={() => {}} />
    );
    expect(screen.getByTestId('cell-0')).toHaveClass('cell--win');
    expect(screen.getByTestId('cell-3')).not.toHaveClass('cell--win');
  });

  it('disables all cells when board disabled', () => {
    render(<Board board={Array(9).fill('')} winningCells={[]} disabled onCellClick={() => {}} />);
    screen.getAllByRole('button').forEach((cell) => expect(cell).toBeDisabled());
  });
});
