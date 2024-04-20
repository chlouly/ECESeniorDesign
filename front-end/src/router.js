import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomeMenu from './pages/HomeMenuPage';
import GameInterface from './pages/GameInterfacePage';
import Settings from './pages/SettingsPage';
import JoinGamePage from './pages/JoinGamePage';
import StartGamePage from './pages/StartGamePage';
import PdfUploadPage from './pages/PdfUploadPage'; 
import ChooseTeamPage from './pages/ChooseTeamPage';
import CallbackPage from './pages/CallBackPage';

import { Navigate } from 'react-router-dom';


const isAuthenticated = () => {
    // localStorage.setItem('id_token', 'eyJraWQiOiJaUjd5MGVDTzFZMGZ4bG1haWM1N2FBem5rT0hGSzdpdjgwZGNCU08xSFF3PSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiNUhCNGhHTVFGaTU2SFN2QzF6MEVHdyIsInN1YiI6IjY0Yzg2NDI4LWUwOTEtNzAxNi1jNTU5LTc5YjZkNzdmNjZjZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJjb2duaXRvOnVzZXJuYW1lIjoiNjRjODY0MjgtZTA5MS03MDE2LWM1NTktNzliNmQ3N2Y2NmNmIiwib3JpZ2luX2p0aSI6ImJmMWY1MDdlLTVhZjUtNDM1ZS1hNDYxLTEzZDU3NGIzY2ZjNyIsImF1ZCI6IjZrZTF0ajBibm1nNmlqNnQ2MzU0bGZzMzBxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTM2NDU3ODgsIm5pY2tuYW1lIjoiYmV0dGVyTWF0ZXVzeiIsImV4cCI6MTcxMzY0OTM4OCwiaWF0IjoxNzEzNjQ1Nzg4LCJqdGkiOiI5MmIxMDc4Mi1mNmFmLTRlNTEtYTAyZC04MGM2Mjk2OTM0YzkiLCJlbWFpbCI6Im1hdGV1c3oucm9tYW5pdWtAb3V0bG9vay5jb20ifQ.Bkquyf52eC514XRvytZLVYW9wh4vIzSoqNb6TpdYe151fCcWP9PpnbqtmxSN8sLROR9K5ERSG8ctXQ4ycMTbUNumH0v6n6Z1A9-nI2N27gdxJsU2EHt0VuXRlvZduE4muTtSbQGCc4uG-6-uOjU4yXm9ZiDs2Vihl-OyTqK4n3c9UOUszzxCqa9IP-D9pesGYU3syIu1KfBJJW51l7d9TDC7i2mzukxXkljOPtBOptbsXZNHKE4icv2_HUG0OpavPgyeENmASDvarQZriPqGAFr4v3FrsxZs-X-NsgjicFG7nE-8wEspPA09_hGaPbW_Bi9Cwwi9VWAtHTPd-12utQ');
    // localStorage.setItem('access_token', 'eyJraWQiOiJ2WXpvTEFsQXBZK3lqbjB4ckFoaWVNeHBTYmRybEdrdW9Zb3pzM1A4TzU4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2NGM4NjQyOC1lMDkxLTcwMTYtYzU1OS03OWI2ZDc3ZjY2Y2YiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI2a2UxdGowYm5tZzZpajZ0NjM1NGxmczMwcSIsIm9yaWdpbl9qdGkiOiJiZjFmNTA3ZS01YWY1LTQzNWUtYTQ2MS0xM2Q1NzRiM2NmYzciLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTcxMzY0NTc4OCwiZXhwIjoxNzEzNjQ5Mzg4LCJpYXQiOjE3MTM2NDU3ODgsImp0aSI6ImQxZTE5OGIyLWVmMTgtNGE1ZS05OWI5LTI0ZGU0ODJiNmNkNyIsInVzZXJuYW1lIjoiNjRjODY0MjgtZTA5MS03MDE2LWM1NTktNzliNmQ3N2Y2NmNmIn0.Lkyg4zQuCNopWxahsoT80zbATIGrMTReH0gQOVbC3I6Q-IViNt-3umonGY_HrSaSTvru4V8omkdepToSeulW7zxU66raYb70jLEk5ipk6jfuXc3Y2Xg1IVjCSxzyKaOp-iy8aMb7OYwRPAWJCUTT5zutLscAdL-PO9S7WXsfoud4y5xvB754GVau5x3PuZTTBglQNvxYPwoutv4ZavELOsUGzXnb8fPeOcsWwK4D6cgf2g6QpBdLb2LIJtrATaNZS_82K4ipH5EtCvn2T3pbdvo87mn_YHPxeupHd-s2IUl1bjcjT8JRqxO7ahvnWt3PvKQTrk7DmXZ-DbneJdbzbA');
    return localStorage.getItem('id_token') !== null;
    // return true;
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
                <Route path="choose" element={<PrivateRoute><ChooseTeamPage /></PrivateRoute>} />
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
