import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeMenu from './pages/HomeMenuPage';
import GameInterface from './pages/GameInterfacePage';
import Settings from './pages/SettingsPage';
import JoinGamePage from './pages/JoinGamePage';
import StartGamePage from './pages/StartGamePage';
import PdfUploadPage from './pages/PdfUploadPage'; 
import { Navigate } from 'react-router-dom';
import CallbackPage from './pages/CallBackPage';

const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

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
                <Route path="/callback" element={<CallbackPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
