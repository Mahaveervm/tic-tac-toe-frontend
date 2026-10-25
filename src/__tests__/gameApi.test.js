import { restApi } from '../api/gameApi';

const okResponse = (body) => ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

describe('REST API client', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve(okResponse({ id: 'g1' })));
  });

  it.each([
    ['createGame', ['Computer'], '/api/games', 'POST', { mode: 'Computer' }],
    ['getGame', ['g1'], '/api/games/g1', undefined, undefined],
    ['makeMove', ['g1', 'X', 1, 2], '/api/games/g1/moves', 'POST', { gameId: 'g1', player: 'X', row: 1, col: 2 }],
    ['undo', ['g1'], '/api/games/g1/undo', 'POST', undefined],
    ['reset', ['g1'], '/api/games/g1/reset', 'POST', undefined],
    ['getScoreboard', [], '/api/scoreboard', undefined, undefined],
    ['resetScoreboard', [], '/api/scoreboard/reset', 'POST', undefined]
  ])('%s calls %s', async (fn, args, url, method, body) => {
    await restApi[fn](...args);
    const [calledUrl, options] = fetch.mock.calls[0];
    expect(calledUrl).toBe(url);
    expect(options.method).toBe(method);
    expect(options.body ? JSON.parse(options.body) : undefined).toEqual(body);
  });

  it('surfaces backend validation messages', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ message: 'Cell is already occupied' }))
    });
    await expect(restApi.makeMove('g1', 'X', 0, 0)).rejects.toThrow('Cell is already occupied');
  });

  it('reports an unreachable backend clearly', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('') });
    await expect(restApi.getScoreboard()).rejects.toThrow('Unable to reach the server');
  });
});
