import { useCallback, useEffect, useRef, useState } from 'react';
import { gameApi } from '../api/gameApi';
import {
  EMPTY_SCOREBOARD,
  MODES,
  STATUS,
  normalizeGame,
  normalizeScoreboard
} from '../utils/normalize';

export function useGame() {
  const [game, setGame] = useState(null);
  const [mode, setMode] = useState(MODES.TWO_PLAYER);
  const [scoreboard, setScoreboard] = useState(EMPTY_SCOREBOARD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const initialized = useRef(false);
  const busy = useRef(false);

  const applyGame = useCallback(async (raw) => {
    const next = normalizeGame(raw);
    setGame(next);
    if (next?.mode) setMode(next.mode);
    if (next?.scoreboard) {
      setScoreboard(next.scoreboard);
    } else {
      setScoreboard(normalizeScoreboard(await gameApi.getScoreboard()));
    }
    return next;
  }, []);

  const run = useCallback(async (action) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e?.message || 'Something went wrong');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  const startGame = useCallback(
    (selectedMode) =>
      run(async () => {
        await applyGame(await gameApi.createGame(selectedMode));
      }),
    [run, applyGame]
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    startGame(MODES.TWO_PLAYER);
  }, [startGame]);

  const isComputerTurn = game?.mode === MODES.COMPUTER && game?.currentPlayer === 'O';

  const boardDisabled =
    !game || loading || game.status !== STATUS.IN_PROGRESS || isComputerTurn;

  const canUndo =
    !!game && !loading && game.status === STATUS.IN_PROGRESS && game.moves.length > 0;

  const changeMode = useCallback(
    (nextMode) => {
      if (game && nextMode === game.mode) return;
      startGame(nextMode);
    },
    [game, startGame]
  );

  const retry = useCallback(() => {
    if (game) {
      run(async () => {
        await applyGame(await gameApi.getGame(game.id));
      });
    } else {
      startGame(mode);
    }
  }, [game, mode, run, applyGame, startGame]);

  const play = useCallback(
    (index) => {
      if (boardDisabled || game.board[index]) return;
      run(async () => {
        await applyGame(
          await gameApi.makeMove(game.id, game.currentPlayer, Math.floor(index / 3), index % 3)
        );
      });
    },
    [boardDisabled, game, run, applyGame]
  );

  const undo = useCallback(() => {
    if (!canUndo) return;
    run(async () => {
      await applyGame(await gameApi.undo(game.id));
    });
  }, [canUndo, game, run, applyGame]);

  const resetGame = useCallback(() => {
    if (!game) {
      startGame(mode);
      return;
    }
    run(async () => {
      await applyGame(await gameApi.reset(game.id));
    });
  }, [game, mode, run, applyGame, startGame]);

  const resetScoreboard = useCallback(
    () =>
      run(async () => {
        const data = await gameApi.resetScoreboard();
        setScoreboard(normalizeScoreboard(data ?? (await gameApi.getScoreboard())));
      }),
    [run]
  );

  const clearError = useCallback(() => setError(''), []);

  return {
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
  };
}
