import { createMockApi } from '../api/mockApi';

describe('mock REST API', () => {
  let api;

  beforeEach(() => {
    api = createMockApi({ latency: 0 });
  });

  it('creates a game session with full game state', async () => {
    const game = await api.createGame('TwoPlayer');
    expect(game).toMatchObject({
      id: expect.any(String),
      board: Array(9).fill(null),
      currentPlayer: 'X',
      mode: 'TwoPlayer',
      status: 'InProgress',
      winner: null,
      winningCells: [],
      moves: [],
      scoreboard: { xWins: 0, oWins: 0, draws: 0 }
    });
  });

  it('gets current game state', async () => {
    const { id } = await api.createGame('TwoPlayer');
    await api.makeMove(id, 'X', 1, 1);
    const game = await api.getGame(id);
    expect(game.board[4]).toBe('X');
  });

  it('rejects unknown game ids', async () => {
    await expect(api.getGame('missing')).rejects.toThrow('Game not found');
  });

  it('makes the computer reply automatically', async () => {
    const { id } = await api.createGame('Computer');
    const game = await api.makeMove(id, 'X', 0, 0);
    expect(game.moves).toHaveLength(2);
    expect(game.moves[1].player).toBe('O');
    expect(game.board[4]).toBe('O');
    expect(game.currentPlayer).toBe('X');
  });

  it('rejects human moves for O in computer mode', async () => {
    const { id } = await api.createGame('Computer');
    await expect(api.makeMove(id, 'O', 0, 0)).rejects.toThrow('Computer controls player O');
  });

  it('computer blocks and wins', async () => {
    const { id } = await api.createGame('Computer');
    await api.makeMove(id, 'X', 0, 0);
    let game = await api.makeMove(id, 'X', 0, 1);
    expect(game.board[2]).toBe('O');
    game = await api.makeMove(id, 'X', 2, 2);
    expect(game.status).toBe('Won');
    expect(game.winner).toBe('O');
    expect(game.winningCells).toEqual([2, 4, 6]);
    expect(game.scoreboard.oWins).toBe(1);
  });

  it('computer does not move after X wins', async () => {
    const { id } = await api.createGame('Computer');
    await api.makeMove(id, 'X', 0, 0);
    await api.makeMove(id, 'X', 2, 2);
    await api.makeMove(id, 'X', 2, 0);
    const game = await api.makeMove(id, 'X', 1, 0);
    expect(game.winningCells).toEqual([0, 3, 6]);
    expect(game.status).toBe('Won');
    expect(game.winner).toBe('X');
    expect(game.moves[game.moves.length - 1].player).toBe('X');
  });

  it('undo in computer mode removes the move pair', async () => {
    const { id } = await api.createGame('Computer');
    await api.makeMove(id, 'X', 0, 0);
    const game = await api.undo(id);
    expect(game.moves).toHaveLength(0);
    expect(game.board).toEqual(Array(9).fill(null));
    expect(game.currentPlayer).toBe('X');
  });

  it('undo in two player mode removes one move', async () => {
    const { id } = await api.createGame('TwoPlayer');
    await api.makeMove(id, 'X', 0, 0);
    await api.makeMove(id, 'O', 1, 1);
    const game = await api.undo(id);
    expect(game.moves).toHaveLength(1);
    expect(game.currentPlayer).toBe('O');
  });

  it('updates the scoreboard once and keeps it on reset', async () => {
    const { id } = await api.createGame('TwoPlayer');
    for (const [p, r, c] of [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]) {
      await api.makeMove(id, p, r, c);
    }
    await expect(api.makeMove(id, 'O', 2, 2)).rejects.toThrow('Game is already completed');
    expect(await api.getScoreboard()).toEqual({ xWins: 1, oWins: 0, draws: 0 });
    const reset = await api.reset(id);
    expect(reset.id).toBe(id);
    expect(reset.moves).toEqual([]);
    expect(reset.scoreboard).toEqual({ xWins: 1, oWins: 0, draws: 0 });
  });

  it('resets the scoreboard', async () => {
    const { id } = await api.createGame('TwoPlayer');
    for (const [p, r, c] of [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]) {
      await api.makeMove(id, p, r, c);
    }
    expect(await api.resetScoreboard()).toEqual({ xWins: 0, oWins: 0, draws: 0 });
    expect(await api.getScoreboard()).toEqual({ xWins: 0, oWins: 0, draws: 0 });
  });
});
