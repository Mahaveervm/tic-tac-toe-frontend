import {
  GAME_MODES,
  GAME_STATUS,
  PLAYERS,
  applyMove,
  chooseComputerMove,
  createEmptyScoreboard,
  createGameState,
  resetGameState,
  undoMove,
  updateScoreboard
} from '../utils/gameLogic';

export function createMockApi({ latency = 50 } = {}) {
  const games = new Map();
  let scoreboard = createEmptyScoreboard();
  let counter = 0;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const respond = (value) =>
    new Promise((resolve) => setTimeout(() => resolve(clone(value)), latency));
  const fail = (message) => Promise.reject(new Error(message));

  const view = (game) => ({
    id: game.id,
    board: game.board,
    currentPlayer: game.currentPlayer,
    mode: game.mode,
    status: game.status,
    winner: game.winner,
    winningCells: game.winningCells,
    moves: game.moves,
    scoreboard: { ...scoreboard }
  });

  const withGame = (id, action) => {
    const game = games.get(id);
    if (!game) return fail('Game not found');
    try {
      action(game);
      return respond(view(game));
    } catch (e) {
      return fail(e.message);
    }
  };

  return {
    createGame(mode) {
      counter += 1;
      const game = createGameState(`game-${counter}`, mode);
      games.set(game.id, game);
      return respond(view(game));
    },

    getGame(id) {
      return withGame(id, () => {});
    },

    makeMove(id, player, row, col) {
      return withGame(id, (game) => {
        if (game.mode === GAME_MODES.COMPUTER && player === PLAYERS.O) {
          throw new Error('Computer controls player O');
        }
        applyMove(game, player, row, col);
        scoreboard = updateScoreboard(scoreboard, game);
        if (
          game.mode === GAME_MODES.COMPUTER &&
          game.status === GAME_STATUS.IN_PROGRESS &&
          game.currentPlayer === PLAYERS.O
        ) {
          const index = chooseComputerMove(game.board);
          applyMove(game, PLAYERS.O, Math.floor(index / 3), index % 3);
          scoreboard = updateScoreboard(scoreboard, game);
        }
      });
    },

    undo(id) {
      return withGame(id, (game) => undoMove(game));
    },

    reset(id) {
      return withGame(id, (game) => resetGameState(game));
    },

    getScoreboard() {
      return respond(scoreboard);
    },

    resetScoreboard() {
      scoreboard = createEmptyScoreboard();
      return respond(scoreboard);
    }
  };
}

export const mockApi = createMockApi();
