import Board from './components/Board';
import Controls from './components/Controls';
import ModeSelector from './components/ModeSelector';
import MoveHistory from './components/MoveHistory';
import Scoreboard from './components/Scoreboard';
import StatusBar from './components/StatusBar';
import { useGame } from './hooks/useGame';
import './App.css';

export default function App() {
  const {
    game,
    mode,
    scoreboard,
    loading,
    error,
    canUndo,
    boardDisabled,
    changeMode,
    play,
    undo,
    resetGame,
    resetScoreboard,
    retry,
    clearError
  } = useGame();

  return (
    <div className="app">
      <header className="app__header">
        <h1>Tic Tac Toe</h1>
      </header>

      {error && (
        <div className="alert" role="alert">
          <span>{error}</span>
          <div className="alert__actions">
            <button type="button" className="alert__retry" onClick={retry}>
              Retry
            </button>
            <button type="button" className="alert__close" onClick={clearError} aria-label="Dismiss error">
              ×
            </button>
          </div>
        </div>
      )}

      <main className="app__main">
        <section className="panel panel--game">
          <ModeSelector mode={mode} onChange={changeMode} disabled={loading} />
          <StatusBar game={game} mode={mode} loading={loading} />
          <Board
            board={game?.board ?? Array(9).fill('')}
            winningCells={game?.winningCells ?? []}
            disabled={boardDisabled}
            onCellClick={play}
          />
          <Controls
            onReset={resetGame}
            onUndo={undo}
            onResetScoreboard={resetScoreboard}
            canUndo={canUndo}
            disabled={loading}
          />
        </section>

        <aside className="app__side">
          <section className="panel">
            <Scoreboard scoreboard={scoreboard} mode={mode} />
          </section>
          <section className="panel">
            <MoveHistory moves={game?.moves ?? []} />
          </section>
        </aside>
      </main>
    </div>
  );
}
