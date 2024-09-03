import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import App from './App';

import TournamentView from './views/TournamentView';
import GameView from './views/GameView';
import AccumulatedStats from './views/AccumulatedStats';

import AddGame from './components/AddGame';
import AddTournament from './components/AddTournament';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tournament/:tournamentId" element={<TournamentView />} />
        <Route path="/tournament/:tournamentId/game/:gameId" element={<GameView />} />
        <Route path="/add-tournament" element={<AddTournament />} />
        <Route path="/tournament/:tournamentId/add-game" element={<AddGame />} />
        <Route path="/tournament/:tournamentId/stats" element={<AccumulatedStats />} /> {/* New Route */}
      </Routes>
    </Router>
  </React.StrictMode>,
);
