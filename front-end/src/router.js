import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeMenu from './pages/HomeMenuPage';
import GameInterface from './pages/GameInterfacePage';
import Settings from './pages/SettingsPage';
import JoinGamePage from './pages/JoinGamePage';
import StartGamePage from './pages/StartGamePage';
import PdfUploadPage from './pages/PdfUploadPage'; 

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeMenu />} />
                <Route path="/game" element={<GameInterface />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/join" element={<JoinGamePage />} />
                <Route path="/start" element={<StartGamePage />} />
                <Route path="/upload" element={<PdfUploadPage />} /> 
                <Route path={`/game/:gameID`} element={<GameInterface />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
