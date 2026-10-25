import { formatPosition } from '../utils/normalize';

export default function MoveHistory({ moves }) {
  return (
    <div>
      <h2>Move History</h2>
      <div className="history">
        {moves.length === 0 ? (
          <p className="history__empty">No moves yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Move</th>
                <th>Player</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move) => (
                <tr key={move.moveNumber}>
                  <td>{move.moveNumber}</td>
                  <td className={`player-${move.player.toLowerCase()}`}>{move.player}</td>
                  <td>{formatPosition(move.row, move.col)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
