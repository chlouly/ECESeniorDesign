import React, { useState, useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const StartGamePage = () => {
  const [gameNumber, setGameNumber] = useState(''); // Initialize gameNumber as an empty string
  const [hasJoined, setHasJoined] = useState(false);
  const navigate = useNavigate();
  const handleNewUser = async () => {
    const access_token = localStorage.getItem("access_token");
    try {
      const response = await fetch("/newuser", {
        method: "GET", // or 'POST' etc., depending on the API requirement
        headers: {
          Authorization: `Bearer ${access_token}`, // Include the access token in the Authorization header
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json(); // Assuming the server responds with JSON
      console.log(data); // Process the data
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  useEffect(() => {
    handleNewUser();
  }, []);

  const handleStartGame = () => {
    console.log('Game started');
    const user_ID = 1; // Assuming you have a logic to set this dynamically
  
    // Sending the request to the backend
    fetch('/joingame', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: user_ID, gameNumber: '' }) // Sending an empty string to create a new game
    })
      .then(response => {
        if (response.status === 200) {
          return response.json(); // Parsing the JSON response body
        } else {
          console.error('Not response 200');
          throw new Error('Failed to join game');
        }
      })
      .then(data => {
        // Data should have the format { gameNumber: YOUR_GAME_NUMBER }
        console.log(data);
        setGameNumber(data.gameNumber); // Updating state with the new game number
        navigate(`/game/${data.gameNumber}`); // Navigating using the updated game number
      })
      .catch(error => {
        alert(error);
        console.error(error);
      });
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100 p-4">
      <div className="text-3xl font-bold text-blue-800 mb-8">Start Game</div>

      {/* Game Information */}
      <div className="flex flex-col items-center mb-6">
        <p className="text-lg mb-2">Game Number: {gameNumber}</p>
        <p className="text-lg mb-4">
          {hasJoined ? 'Somebody has joined the game.' : 'Nobody has joined the game.'}
        </p>

        {/* Start Button */}
        <button
          className="flex items-center justify-center px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          onClick={handleStartGame}
          // disabled={!hasJoined} // Santi enable this button dynamically with the backend API
        >
          <FiPlay className="mr-2" />
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartGamePage;
