import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeMenu from './pages/HomeMenuPage';
import GameInterface from './pages/GameInterfacePage';
import Settings from './pages/SettingsPage';
import JoinGamePage from './pages/JoinGamePage';
import StartGamePage from './pages/StartGamePage';

// This is the main router for the application

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeMenu />} />
                <Route path="/game" element={<GameInterface />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/join" element={<JoinGamePage />} />
                <Route path="/start" element={<StartGamePage />} />

            </Routes>
        </Router>
    );
};

export default AppRouter;