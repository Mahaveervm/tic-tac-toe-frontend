# Tic Tac Toe – React Frontend

## Project Overview
Browser-based Tic Tac Toe built with React. It supports Two Player Mode and Play Against Computer, move history, undo, a session scoreboard, and win/draw detection with highlighted winning cells. The UI talks to a backend through REST APIs. A built-in mock backend (same API contract, in-memory) lets the app run without the .NET API.

## Tech Stack
- React 18 (Vite 5)
- REST API client using `fetch`
- In-memory mock backend (`src/api/mockApi.js`)
- Vitest + React Testing Library

## Features Implemented
- 3 × 3 board, empty cells clickable, filled cells locked
- Current player, selected mode, winner / draw message
- Row, column and diagonal win detection with highlighted cells
- Draw detection
- Moves blocked after the game is completed
- Move history table (Move, Player, Position)
- Undo Last Move: one move in Two Player Mode, the computer move plus the previous human move in Computer Mode; disabled when there are no moves
- Scoreboard (X wins, O wins, draws), updated once per completed game, unchanged by Reset Game
- Reset Game and Reset Scoreboard
- Computer opponent (O) with priority: win, block, center, corner, any cell
- Backend validation errors shown in the UI, with Retry

## Project Structure
```
src/
  api/gameApi.js        REST client and mock/real switch
  api/mockApi.js        In-memory backend implementing the API contract
  utils/gameLogic.js    Core game rules
  utils/normalize.js    Maps backend responses to UI state
  hooks/useGame.js      Game state and actions
  components/           Board, Cell, StatusBar, ModeSelector, Controls, MoveHistory, Scoreboard
  __tests__/            Unit, component and integration tests
```

## Run the Frontend Locally
```
npm install
npm run dev
```
Open http://localhost:5173

## Backend Configuration
`.env`
```
API_TARGET=http://localhost:5000
VITE_API_BASE_URL=
VITE_USE_MOCK=true
```
- `VITE_USE_MOCK=true` uses the built-in mock backend.
- `VITE_USE_MOCK=false` calls the .NET API. Vite proxies `/api` to `API_TARGET`. Set it to the port your .NET API listens on.
- Restart `npm run dev` after changing `.env`.

## How to Run Tests
```
npm test
```

## API Endpoint Summary
| Method | Endpoint | Purpose | Body |
| --- | --- | --- | --- |
| POST | /api/games | Create a new game session | `{ "mode": "TwoPlayer" \| "Computer" }` |
| GET | /api/games/{id} | Get current game state | – |
| POST | /api/games/{id}/moves | Submit a player move | `{ "gameId": "id", "player": "X", "row": 0, "col": 2 }` |
| POST | /api/games/{id}/undo | Undo last move (pair in Computer Mode) | – |
| POST | /api/games/{id}/reset | Reset the current game | – |
| GET | /api/scoreboard | Get scoreboard | – |
| POST | /api/scoreboard/reset | Reset scoreboard | – |

Rows and columns are 0-based in the API and shown 1-based in the UI.

### Game State Response
```json
{
  "id": "game-1",
  "board": ["X", null, null, null, "O", null, null, null, null],
  "currentPlayer": "X",
  "mode": "Computer",
  "status": "InProgress",
  "winner": null,
  "winningCells": [],
  "moves": [
    { "moveNumber": 1, "player": "X", "row": 0, "col": 0 },
    { "moveNumber": 2, "player": "O", "row": 1, "col": 1 }
  ],
  "scoreboard": { "xWins": 0, "oWins": 0, "draws": 0 }
}
```
`status`: `InProgress`, `Won`, `Draw`.

### Error Response
HTTP 400 / 404 with `{ "message": "Cell is already occupied" }`.

Rejected moves: outside the board, occupied cell, after completion, wrong player, O moved by a human in Computer Mode.

## AI Tools and Prompt Summary
- Tool: Claude (Anthropic)
- Prompts used: generate a React-only frontend from the problem statement; fix the npm install and test setup issues; add a mock backend so the game runs without the .NET API; audit the implementation against every requirement and add the missing parts.
- AI generated: components, hook, API client, mock backend, game logic and tests.
- Reviewed manually: undo rules per mode, scoreboard counting once, computer move priority, API contract.

## Design Decisions
- The backend is the source of truth. The UI renders only what the API returns.
- Core rules live in `gameLogic.js`, separate from React, so they are easy to test.
- `normalize.js` accepts small contract differences (2D board, numeric enums, `cellIndex` moves).
- The board is locked while a request is running and while it is the computer's turn.

## Clarifications and Assumptions
- Scoreboard and Undo: **Option A**. Undo is disabled once a game is won or drawn, so the scoreboard stays final.
- The human is always X and the computer is always O. X always starts.
- The computer moves immediately in the same move request.
- Reset Game keeps the same game id and mode and clears the board, moves and status.
- Changing mode starts a new game session.
- The scoreboard is shared across all games in the session.

## Known Limitations
- The mock backend stores data in memory, so a page refresh clears it.
- The .NET backend is not part of this repository.
- No authentication or multi-user support.

## Future Improvements
- Persist scoreboard with SQLite
- Undo after completion with scoreboard adjustment (Option B)
- Unbeatable computer using minimax
- Keyboard navigation for the board
- End-to-end tests with Playwright
