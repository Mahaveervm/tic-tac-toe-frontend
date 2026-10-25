import {
  formatPosition,
  normalizeBoard,
  normalizeGame,
  normalizeMode,
  normalizeMoves,
  normalizeStatus,
  normalizeWinningCells
} from '../utils/normalize';

describe('normalize', () => {
  it('flattens a 2D board', () => {
    expect(normalizeBoard([['X', null, 'O'], [null, 'X', null], [null, null, 'O']])).toEqual([
      'X', '', 'O', '', 'X', '', '', '', 'O'
    ]);
  });

  it('handles null board', () => {
    expect(normalizeBoard(null)).toEqual(Array(9).fill(''));
  });

  it('handles numeric cell values', () => {
    expect(normalizeBoard([1, 2, 0, 0, 0, 0, 0, 0, 0]).slice(0, 3)).toEqual(['X', 'O', '']);
  });

  it('handles numeric and string enums', () => {
    expect(normalizeStatus(1)).toBe('Won');
    expect(normalizeStatus(2)).toBe('Draw');
    expect(normalizeStatus('IN_PROGRESS')).toBe('InProgress');
    expect(normalizeMode(1)).toBe('Computer');
    expect(normalizeMode('twoPlayer')).toBe('TwoPlayer');
  });

  it('converts row/col winning cells to indexes', () => {
    expect(normalizeWinningCells([{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }])).toEqual([0, 4, 8]);
  });

  it('converts cell index moves to row/col', () => {
    expect(normalizeMoves([{ player: 'x', cellIndex: 5 }])).toEqual([
      { moveNumber: 1, player: 'X', row: 1, col: 2 }
    ]);
  });

  it('normalizes game payload', () => {
    const game = normalizeGame({ gameId: 'abc', board: Array(9).fill(null), currentPlayer: 'X', status: 'InProgress' });
    expect(game.id).toBe('abc');
    expect(game.winner).toBeNull();
    expect(game.moves).toEqual([]);
  });

  it('formats position as 1-based', () => {
    expect(formatPosition(0, 0)).toBe('Row 1, Column 1');
  });
});
