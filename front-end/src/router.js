import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomeMenu from './pages/HomeMenuPage';
import GameInterface from './pages/GameInterfacePage';
import Settings from './pages/SettingsPage';
import JoinGamePage from './pages/JoinGamePage';
import StartGamePage from './pages/StartGamePage';
import PdfUploadPage from './pages/PdfUploadPage'; 

import CallbackPage from './pages/CallBackPage';

import { Navigate } from 'react-router-dom';


const isAuthenticated = () => {
    return localStorage.getItem('id_token') !== null;
};

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? 
        children : 
        <Navigate to="/login" replace />;
};

const LoginPage = () => {
    useEffect(() => {
        window.location.href = 'https://pokidips.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=6ke1tj0bnmg6ij6t6354lfs30q&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fpokidips.games%2Fcallback';
    }, []);

    return <div>Redirecting to login...</div>;
};

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PrivateRoute><HomeMenu /></PrivateRoute>} />
                {/* <Route path="/game" element={<PrivateRoute><GameInterface /></PrivateRoute>} /> */}
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/join" element={<PrivateRoute><JoinGamePage /></PrivateRoute>} />
                <Route path="/start" element={<PrivateRoute><StartGamePage /></PrivateRoute>} />
                <Route path="/upload" element={<PrivateRoute><PdfUploadPage /></PrivateRoute>} />
                <Route path={`/game/:gameID`} element={<PrivateRoute><GameInterface /></PrivateRoute>} />
                <Route path="/callback" element={<CallbackPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
