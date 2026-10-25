import { MODES, STATUS } from '../utils/normalize';

export default function StatusBar({ game, mode, loading }) {
  const activeMode = game?.mode ?? mode;
  const modeLabel = activeMode === MODES.COMPUTER ? 'Play Against Computer' : 'Two Player Mode';

  let message = loading ? 'Starting game...' : 'No active game';
  let modifier = '';

  if (game) {
    if (game.status === STATUS.WON) {
      message =
        activeMode === MODES.COMPUTER && game.winner === 'O'
          ? 'Computer (O) wins!'
          : `Player ${game.winner} wins!`;
      modifier = 'status__message--won';
    } else if (game.status === STATUS.DRAW) {
      message = "It's a draw!";
      modifier = 'status__message--draw';
    } else if (activeMode === MODES.COMPUTER && game.currentPlayer === 'O') {
      message = 'Computer is thinking...';
    } else {
      message = `Player ${game.currentPlayer}'s turn`;
    }
  }

  return (
    <div className="status" aria-live="polite">
      <div className="status__mode" data-testid="selected-mode">
        Mode: {modeLabel}
      </div>
      <div className={`status__message ${modifier}`} data-testid="status-message">
        {message}
      </div>
    </div>
  );
}
