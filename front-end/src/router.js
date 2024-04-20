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
    // localStorage.setItem('id_token', 'eyJraWQiOiJaUjd5MGVDTzFZMGZ4bG1haWM1N2FBem5rT0hGSzdpdjgwZGNCU08xSFF3PSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiM3NLYTlhYklGckc2Wk81V2g5aFRTZyIsInN1YiI6IjY0Yzg2NDI4LWUwOTEtNzAxNi1jNTU5LTc5YjZkNzdmNjZjZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJjb2duaXRvOnVzZXJuYW1lIjoiNjRjODY0MjgtZTA5MS03MDE2LWM1NTktNzliNmQ3N2Y2NmNmIiwib3JpZ2luX2p0aSI6ImQ4NmQ1MWQ0LTRhZmQtNDEzZi1iZTk2LTE0ZWEyNDA0YmI2YSIsImF1ZCI6IjZrZTF0ajBibm1nNmlqNnQ2MzU0bGZzMzBxIiwiZXZlbnRfaWQiOiJhYjkxNGMzMS00Mjg2LTRiMmUtYTg5ZC1mNWRkNDY3YWEyZjgiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTcxMzU1OTUzNiwibmlja25hbWUiOiJiZXR0ZXJNYXRldXN6IiwiZXhwIjoxNzEzNTYzMTM2LCJpYXQiOjE3MTM1NTk1MzYsImp0aSI6ImJhMmQwMjU5LTY5YWItNDc2ZS1hZTM5LWJlNGFjZDFjNzg1NSIsImVtYWlsIjoibWF0ZXVzei5yb21hbml1a0BvdXRsb29rLmNvbSJ9.RGI5kloQLSUvrNjAvtL9_lyTb7-IzDBW8DhfRAUePZVxbz7uREuLl_R8BPx-VVXJjyFn3tNCxwsIXE70lj0foMd8Oi18PAsL76XPUsIAHl3QCyHYvsus3vma2FO64szbij--D9Injo3RRzwLpno9CfWtroBiWhKSeJkfFf6OYxIwyn7c-gmfX55QbvNfIImw47WIsz8j6UWMRtwYOKLf52RjGiCP1BXDK4gvSAwRNppO-iRr97tE91PCxeeCOFXTzldno3RJc74HgVJf9twKDVgnapflR88dkVpr7BxqiEE7lofKYPpetS_8M6iZ9PiuNhHiCOd2-YTblPAPpzP94w');
    // localStorage.setItem('access_token', 'eyJraWQiOiJ2WXpvTEFsQXBZK3lqbjB4ckFoaWVNeHBTYmRybEdrdW9Zb3pzM1A4TzU4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2NGM4NjQyOC1lMDkxLTcwMTYtYzU1OS03OWI2ZDc3ZjY2Y2YiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI2a2UxdGowYm5tZzZpajZ0NjM1NGxmczMwcSIsIm9yaWdpbl9qdGkiOiJkODZkNTFkNC00YWZkLTQxM2YtYmU5Ni0xNGVhMjQwNGJiNmEiLCJldmVudF9pZCI6ImFiOTE0YzMxLTQyODYtNGIyZS1hODlkLWY1ZGQ0NjdhYTJmOCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIiwiYXV0aF90aW1lIjoxNzEzNTU5NTM2LCJleHAiOjE3MTM1NjMxMzYsImlhdCI6MTcxMzU1OTUzNiwianRpIjoiMmFiMjYyOTUtMTRhMi00NmRkLWE2MTYtMDE5MzczYzIzMjZiIiwidXNlcm5hbWUiOiI2NGM4NjQyOC1lMDkxLTcwMTYtYzU1OS03OWI2ZDc3ZjY2Y2YifQ.evXmSuerwxG69L6TzImOeX9gL0cHskLQS53sC4khrSwKhhULQ62Se92Fb2TEXe269ZfRuPZ0NS9YYfMzznaZ9ITLcqJl1jxK6oqpfiQ56ycsMZ9HuUocECD3hzlJXFdMmHKvTZNVCTgOm2agyEgaiNbfnX0iPqn3pMEqRh-R9X27_YTrkLpLmztZX9VcVc9UKEpm5WK4Jkb_3_IoHT2VbH3bs6ekvn5R48-AQjKsUG8ortC5yEFkrbP_bhWynz2azypWm5rzuJ_y5Zpxb2mZqtBTGXCtMcaPnMDzuVATQC8pUxCENvTGUtxrAjMKNU8yPBnwHQIk_io6LgTzbxoZZQ');
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
