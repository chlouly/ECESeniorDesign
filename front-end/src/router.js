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
    // localStorage.setItem('id_token', 'eyJraWQiOiJaUjd5MGVDTzFZMGZ4bG1haWM1N2FBem5rT0hGSzdpdjgwZGNCU08xSFF3PSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiNnBqZURlUW9IZmpPalBlQ3VXVnkzZyIsInN1YiI6IjY0Yzg2NDI4LWUwOTEtNzAxNi1jNTU5LTc5YjZkNzdmNjZjZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJjb2duaXRvOnVzZXJuYW1lIjoiNjRjODY0MjgtZTA5MS03MDE2LWM1NTktNzliNmQ3N2Y2NmNmIiwib3JpZ2luX2p0aSI6IjkwY2Y2Y2Q0LTlkMmYtNGJjZS04ZjU0LTU1YTY3NDVlMjIxZCIsImF1ZCI6IjZrZTF0ajBibm1nNmlqNnQ2MzU0bGZzMzBxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTM1NDE5NDUsIm5pY2tuYW1lIjoiYmV0dGVyTWF0ZXVzeiIsImV4cCI6MTcxMzU0NTU0NSwiaWF0IjoxNzEzNTQxOTQ1LCJqdGkiOiIzODE4NWIwOS02MTcwLTRlMjMtOWUzNC0yOGU4M2Y4NjZiZmIiLCJlbWFpbCI6Im1hdGV1c3oucm9tYW5pdWtAb3V0bG9vay5jb20ifQ.jte61b0uBzaLyXyVOxwRGhxLnCZNatekAEfhR-O8hReisl8-L-ojZdBz5S3Jql7Ci3Nj0utpn6GqyPe9zR-kkJtL4fci3YiJgJkc-dZj7Wewfy4Lkub_nYr2cgZjvrrJT_ZgegrY8Xx2pebmMda_8e6rsFlff8-UCKD5wC7YYOZZ4EcxfQogac9U7mDfHZoWdZqweoX4Wz0sXS1YlBR5griqHj_2zTjb4UlqU6o-3O6uQ3UCie_QNn1JZamm-yqweINvSWs7qfMYq-eHY03XiVOQL5IHEBeblCV7TgcMIrvH66SC2IpKRdkUsJnfiKq71wu8j50Nx4qMRct618PiCg');
    // localStorage.setItem('access_token', 'eyJraWQiOiJ2WXpvTEFsQXBZK3lqbjB4ckFoaWVNeHBTYmRybEdrdW9Zb3pzM1A4TzU4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2NGM4NjQyOC1lMDkxLTcwMTYtYzU1OS03OWI2ZDc3ZjY2Y2YiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI2a2UxdGowYm5tZzZpajZ0NjM1NGxmczMwcSIsIm9yaWdpbl9qdGkiOiI5MGNmNmNkNC05ZDJmLTRiY2UtOGY1NC01NWE2NzQ1ZTIyMWQiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTcxMzU0MTk0NSwiZXhwIjoxNzEzNTQ1NTQ1LCJpYXQiOjE3MTM1NDE5NDUsImp0aSI6ImI2NGNjODMyLWNjNWYtNGIxMi04MTk2LTUzNTY3MTUzZjNjMyIsInVzZXJuYW1lIjoiNjRjODY0MjgtZTA5MS03MDE2LWM1NTktNzliNmQ3N2Y2NmNmIn0.NlvUHwRoT1h-pUzX-qf84xWxIU4kH2YMF0FCLNLfZ7lUpQp5uhHnrGaK0edNJlgQbQ1XRkp87C8c6oMG5GFZnxtQXO3CxoeSy0efol134rrq1PjYGZJACYWNLco-iu232xD7pvs4CZmi2be1QO7p4HMufngWcPnv9RRj3TzI55CZaKIKcT1K_RIRFDBZu-swYBd7aFusQkYDjPLxLWtb7lXcgcfw678toT9DPCf-q3wYRLeFT7NAGkNrZsFcmma3JWeck3bOiZJn6HOxIblGeOczXjJand-tEG6DnryqLWq_YAZAx2siZDAdki91gkLduSuckaOmTr_4x7TjLiBPYg');
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
