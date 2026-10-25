import { MODES } from '../utils/normalize';

export default function Scoreboard({ scoreboard, mode }) {
  const xLabel = mode === MODES.COMPUTER ? 'You (X) Wins' : 'X Wins';
  const oLabel = mode === MODES.COMPUTER ? 'Computer (O) Wins' : 'O Wins';

  return (
    <div>
      <h2>Scoreboard</h2>
      <div className="scoreboard">
        <div className="score score--x">
          <div className="score__label">{xLabel}</div>
          <div className="score__value" data-testid="score-x">{scoreboard.xWins}</div>
        </div>
        <div className="score score--o">
          <div className="score__label">{oLabel}</div>
          <div className="score__value" data-testid="score-o">{scoreboard.oWins}</div>
        </div>
        <div className="score">
          <div className="score__label">Draws</div>
          <div className="score__value" data-testid="score-draws">{scoreboard.draws}</div>
        </div>
      </div>
    </div>
  );
}
