export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export const PLAYERS = { X: 'X', O: 'O' };
export const GAME_MODES = { TWO_PLAYER: 'TwoPlayer', COMPUTER: 'Computer' };
export const GAME_STATUS = { IN_PROGRESS: 'InProgress', WON: 'Won', DRAW: 'Draw' };

export const createEmptyScoreboard = () => ({ xWins: 0, oWins: 0, draws: 0 });

export const createGameState = (id, mode) => ({
  id,
  mode: mode === GAME_MODES.COMPUTER ? GAME_MODES.COMPUTER : GAME_MODES.TWO_PLAYER,
  board: Array(9).fill(null),
  currentPlayer: PLAYERS.X,
  status: GAME_STATUS.IN_PROGRESS,
  winner: null,
  winningCells: [],
  moves: [],
  scored: false
});

export function findWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], cells: [...line] };
    }
  }
  return null;
}

export function evaluateStatus(board) {
  const result = findWinner(board);
  if (result) return { status: GAME_STATUS.WON, winner: result.winner, winningCells: result.cells };
  if (board.every(Boolean)) return { status: GAME_STATUS.DRAW, winner: null, winningCells: [] };
  return { status: GAME_STATUS.IN_PROGRESS, winner: null, winningCells: [] };
}

export const nextPlayer = (player) => (player === PLAYERS.X ? PLAYERS.O : PLAYERS.X);

export function validateMove(game, player, row, col) {
  if (game.status !== GAME_STATUS.IN_PROGRESS) return 'Game is already completed';
  if (![row, col].every((v) => Number.isInteger(v) && v >= 0 && v <= 2)) return 'Move is outside the board';
  if (player !== PLAYERS.X && player !== PLAYERS.O) return 'Invalid player';
  if (player !== game.currentPlayer) return `It is ${game.currentPlayer}'s turn`;
  if (game.board[row * 3 + col]) return 'Cell is already occupied';
  return null;
}

export function updateScoreboard(scoreboard, game) {
  if (game.status === GAME_STATUS.IN_PROGRESS || game.scored) return scoreboard;
  game.scored = true;
  if (game.status === GAME_STATUS.DRAW) return { ...scoreboard, draws: scoreboard.draws + 1 };
  if (game.winner === PLAYERS.X) return { ...scoreboard, xWins: scoreboard.xWins + 1 };
  return { ...scoreboard, oWins: scoreboard.oWins + 1 };
}

export function applyMove(game, player, row, col) {
  const error = validateMove(game, player, row, col);
  if (error) throw new Error(error);
  const index = row * 3 + col;
  game.board[index] = player;
  game.moves.push({ moveNumber: game.moves.length + 1, player, row, col });
  Object.assign(game, evaluateStatus(game.board));
  if (game.status === GAME_STATUS.IN_PROGRESS) game.currentPlayer = nextPlayer(player);
  return game;
}

function findCompletingMove(board, player) {
  for (const line of WIN_LINES) {
    const values = line.map((i) => board[i]);
    if (values.filter((v) => v === player).length === 2 && values.includes(null)) {
      return line[values.indexOf(null)];
    }
  }
  return -1;
}

export function chooseComputerMove(board) {
  const win = findCompletingMove(board, PLAYERS.O);
  if (win >= 0) return win;
  const block = findCompletingMove(board, PLAYERS.X);
  if (block >= 0) return block;
  if (!board[4]) return 4;
  const corner = [0, 2, 6, 8].find((i) => !board[i]);
  if (corner !== undefined) return corner;
  return board.findIndex((cell) => !cell);
}

export function undoMove(game) {
  if (game.status !== GAME_STATUS.IN_PROGRESS) throw new Error('Undo is disabled after the game is completed');
  if (game.moves.length === 0) throw new Error('No moves to undo');
  const last = game.moves[game.moves.length - 1];
  const count = game.mode === GAME_MODES.COMPUTER && last.player === PLAYERS.O ? 2 : 1;
  for (let i = 0; i < count && game.moves.length > 0; i += 1) {
    const move = game.moves.pop();
    game.board[move.row * 3 + move.col] = null;
  }
  game.currentPlayer = game.moves.length === 0 ? PLAYERS.X : nextPlayer(game.moves[game.moves.length - 1].player);
  Object.assign(game, evaluateStatus(game.board));
  return game;
}

export function resetGameState(game) {
  const fresh = createGameState(game.id, game.mode);
  Object.assign(game, fresh);
  return game;
}
