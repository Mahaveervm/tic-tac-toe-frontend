export default function Controls({ onReset, onUndo, onResetScoreboard, canUndo, disabled }) {
  return (
    <div className="controls">
      <button type="button" className="btn" onClick={onUndo} disabled={!canUndo}>
        Undo Last Move
      </button>
      <button type="button" className="btn btn--primary" onClick={onReset} disabled={disabled}>
        Reset Game
      </button>
      <button type="button" className="btn btn--danger" onClick={onResetScoreboard} disabled={disabled}>
        Reset Scoreboard
      </button>
    </div>
  );
}
