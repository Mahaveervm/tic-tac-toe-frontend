import { mockApi } from './mockApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new Error('Unable to reach the server. Make sure the backend API is running.');
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    if ([502, 503, 504].includes(response.status) || (response.status === 500 && !data)) {
      throw new Error('Unable to reach the server. Make sure the backend API is running.');
    }
    const message =
      data?.message || data?.error || data?.detail || data?.title || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const restApi = {
  createGame: (mode) =>
    request('/api/games', { method: 'POST', body: JSON.stringify({ mode }) }),

  getGame: (id) => request(`/api/games/${id}`),

  makeMove: (id, player, row, col) =>
    request(`/api/games/${id}/moves`, {
      method: 'POST',
      body: JSON.stringify({ gameId: id, player, row, col })
    }),

  undo: (id) => request(`/api/games/${id}/undo`, { method: 'POST' }),

  reset: (id) => request(`/api/games/${id}/reset`, { method: 'POST' }),

  getScoreboard: () => request('/api/scoreboard'),

  resetScoreboard: () => request('/api/scoreboard/reset', { method: 'POST' })
};

export const gameApi = USE_MOCK ? mockApi : restApi;
