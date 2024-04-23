import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomeMenu from "./pages/HomeMenuPage";
import GameInterface from "./pages/GameInterfacePage";
import Settings from "./pages/SettingsPage";
import JoinGamePage from "./pages/JoinGamePage";
import StartGamePage from "./pages/StartGamePage";
import PdfUploadPage from "./pages/PdfUploadPage";
import ChooseTeamPage from "./pages/ChooseTeamPage";
import CallbackPage from "./pages/CallBackPage";

import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  // localStorage.setItem('id_token', 'eyJraWQiOiJaUjd5MGVDTzFZMGZ4bG1haWM1N2FBem5rT0hGSzdpdjgwZGNCU08xSFF3PSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiNUhCNGhHTVFGaTU2SFN2QzF6MEVHdyIsInN1YiI6IjY0Yzg2NDI4LWUwOTEtNzAxNi1jNTU5LTc5YjZkNzdmNjZjZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJjb2duaXRvOnVzZXJuYW1lIjoiNjRjODY0MjgtZTA5MS03MDE2LWM1NTktNzliNmQ3N2Y2NmNmIiwib3JpZ2luX2p0aSI6ImJmMWY1MDdlLTVhZjUtNDM1ZS1hNDYxLTEzZDU3NGIzY2ZjNyIsImF1ZCI6IjZrZTF0ajBibm1nNmlqNnQ2MzU0bGZzMzBxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTM2NDU3ODgsIm5pY2tuYW1lIjoiYmV0dGVyTWF0ZXVzeiIsImV4cCI6MTcxMzY0OTM4OCwiaWF0IjoxNzEzNjQ1Nzg4LCJqdGkiOiI5MmIxMDc4Mi1mNmFmLTRlNTEtYTAyZC04MGM2Mjk2OTM0YzkiLCJlbWFpbCI6Im1hdGV1c3oucm9tYW5pdWtAb3V0bG9vay5jb20ifQ.Bkquyf52eC514XRvytZLVYW9wh4vIzSoqNb6TpdYe151fCcWP9PpnbqtmxSN8sLROR9K5ERSG8ctXQ4ycMTbUNumH0v6n6Z1A9-nI2N27gdxJsU2EHt0VuXRlvZduE4muTtSbQGCc4uG-6-uOjU4yXm9ZiDs2Vihl-OyTqK4n3c9UOUszzxCqa9IP-D9pesGYU3syIu1KfBJJW51l7d9TDC7i2mzukxXkljOPtBOptbsXZNHKE4icv2_HUG0OpavPgyeENmASDvarQZriPqGAFr4v3FrsxZs-X-NsgjicFG7nE-8wEspPA09_hGaPbW_Bi9Cwwi9VWAtHTPd-12utQ');
//   localStorage.setItem("access_token","eyJraWQiOiJ2WXpvTEFsQXBZK3lqbjB4ckFoaWVNeHBTYmRybEdrdW9Zb3pzM1A4TzU4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2NGM4NjQyOC1lMDkxLTcwMTYtYzU1OS03OWI2ZDc3ZjY2Y2YiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9aeUZ2TDNNVXkiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI2a2UxdGowYm5tZzZpajZ0NjM1NGxmczMwcSIsIm9yaWdpbl9qdGkiOiI4ODMxMGU1NS0yYjg1LTQ1ZDktYjIyNi1iZTg5ZGUzYmIxOWUiLCJldmVudF9pZCI6Ijc4YTYyYTE0LTUzM2EtNDcxZi05YWZmLTEwYTUzMmMyZjVmNSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIiwiYXV0aF90aW1lIjoxNzEzNzI1MjYwLCJleHAiOjE3MTM3Mjg4NjAsImlhdCI6MTcxMzcyNTI2MCwianRpIjoiODdkY2I0YjUtNWY0My00NTU0LWEwNWMtMGQwMGQ0MjgzYmUwIiwidXNlcm5hbWUiOiI2NGM4NjQyOC1lMDkxLTcwMTYtYzU1OS03OWI2ZDc3ZjY2Y2YifQ.NUVTbe2rGXtBt271mRZJQj304yGgRVuGXgPlWg_e34DYXJ7YhmmTZG0unXg_ScNoAZTORn7mCPWaobmEmNqlEpvN1ckZ2HKvUR0o7kRCQAITfMopxadGvN46YFQb6xSDU8OUn0OQ1vGYRDtjIsRXb7w9rtqkb1u21um1KmqbQSNggfj-7Yc5Zh8sqC-RTdp1JNuz--AWzs2BQ0RH5YDQ8aL40ku3PnaVpos9Q5Juw6C_Z36-acwxjBgVC8d79oVxVaT_a8RqATBlQxHzSvex7KayBmzTzLjf1coWETLyN7h9qsmvFPELH_HG2lrLfQKmXgsBIouaRE4rEGo6n540oQ");

  return localStorage.getItem("access_token") !== null;
  // return true;
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const LoginPage = () => {
  useEffect(() => {
    window.location.href =
      "https://pokidips.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=6ke1tj0bnmg6ij6t6354lfs30q&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fpokidips.games%2Fcallback";
  }, []);

  return <div>Redirecting to login...</div>;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomeMenu />
            </PrivateRoute>
          }
        />
        {/* <Route path="/game" element={<PrivateRoute><GameInterface /></PrivateRoute>} /> */}
        <Route
          path="choose"
          element={
            <PrivateRoute>
              <ChooseTeamPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/join"
          element={
            <PrivateRoute>
              <JoinGamePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/start"
          element={
            <PrivateRoute>
              <StartGamePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <PdfUploadPage />
            </PrivateRoute>
          }
        />
        <Route
          path={`/game/:gameID`}
          element={
            <PrivateRoute>
              <GameInterface />
            </PrivateRoute>
          }
        />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
