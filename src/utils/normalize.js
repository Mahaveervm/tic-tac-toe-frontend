export const MODES = {
  TWO_PLAYER: 'TwoPlayer',
  COMPUTER: 'Computer'
};

export const STATUS = {
  IN_PROGRESS: 'InProgress',
  WON: 'Won',
  DRAW: 'Draw'
};

export const EMPTY_SCOREBOARD = { xWins: 0, oWins: 0, draws: 0 };

const STATUS_BY_NUMBER = [STATUS.IN_PROGRESS, STATUS.WON, STATUS.DRAW];
const MODE_BY_NUMBER = [MODES.TWO_PLAYER, MODES.COMPUTER];

const toCell = (value) => {
  if (value === null || value === undefined) return '';
  if (value === 1) return 'X';
  if (value === 2) return 'O';
  const symbol = String(value).toUpperCase();
  return symbol === 'X' || symbol === 'O' ? symbol : '';
};

export function normalizeStatus(status) {
  if (typeof status === 'number') return STATUS_BY_NUMBER[status] ?? STATUS.IN_PROGRESS;
  const value = String(status ?? '').replace(/[\s_-]/g, '').toLowerCase();
  if (value === 'won' || value === 'win') return STATUS.WON;
  if (value === 'draw') return STATUS.DRAW;
  return STATUS.IN_PROGRESS;
}

export function normalizeMode(mode) {
  if (typeof mode === 'number') return MODE_BY_NUMBER[mode] ?? MODES.TWO_PLAYER;
  const value = String(mode ?? '').replace(/[\s_-]/g, '').toLowerCase();
  return value === 'computer' || value === 'vscomputer' || value === 'playagainstcomputer'
    ? MODES.COMPUTER
    : MODES.TWO_PLAYER;
}

export function normalizeBoard(board) {
  if (!board) return Array(9).fill('');
  let flat = board;
  if (typeof board === 'string') flat = board.split('');
  else if (Array.isArray(board[0])) flat = board.flat();
  return Array.from({ length: 9 }, (_, i) => toCell(flat[i]));
}

export function normalizeWinningCells(cells) {
  if (!Array.isArray(cells)) return [];
  return cells
    .map((c) => (typeof c === 'number' ? c : c?.row * 3 + (c?.col ?? c?.column)))
    .filter((i) => Number.isInteger(i) && i >= 0 && i < 9);
}

export function normalizeMoves(moves) {
  if (!Array.isArray(moves)) return [];
  return moves.map((m, i) => {
    const index = m.cellIndex ?? m.index;
    return {
      moveNumber: m.moveNumber ?? i + 1,
      player: toCell(m.player),
      row: m.row ?? Math.floor(index / 3),
      col: m.col ?? m.column ?? index % 3
    };
  });
}

export function normalizeScoreboard(scoreboard) {
  return {
    xWins: scoreboard?.xWins ?? 0,
    oWins: scoreboard?.oWins ?? 0,
    draws: scoreboard?.draws ?? 0
  };
}

export function normalizeGame(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.gameId,
    board: normalizeBoard(raw.board),
    currentPlayer: toCell(raw.currentPlayer) || 'X',
    mode: normalizeMode(raw.mode ?? raw.gameMode),
    status: normalizeStatus(raw.status ?? raw.gameStatus),
    winner: toCell(raw.winner) || null,
    winningCells: normalizeWinningCells(raw.winningCells),
    moves: normalizeMoves(raw.moves ?? raw.moveHistory),
    scoreboard: raw.scoreboard ? normalizeScoreboard(raw.scoreboard) : null
  };
}

export const formatPosition = (row, col) => `Row ${row + 1}, Column ${col + 1}`;
