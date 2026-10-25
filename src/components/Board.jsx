import Cell from './Cell';

export default function Board({ board, winningCells, disabled, onCellClick }) {
  return (
    <div className="board" role="group" aria-label="Tic Tac Toe board">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          highlighted={winningCells.includes(index)}
          disabled={disabled}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}
