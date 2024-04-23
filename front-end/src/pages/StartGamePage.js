import React, { useState, useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const StartGamePage = () => {
  const [gameNumber, setGameNumber] = useState(''); // Initialize gameNumber as an empty string
  const [hasJoined, setHasJoined] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    console.log('Game started');
    const user_ID = localStorage.getItem('user_id'); 
  
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
        localStorage.setItem('gameNumber', data.gameNumber); // Storing the game number in local storage
        localStorage.setItem('to_move', data.to_move); // Storing the player ID in local storage
        localStorage.setItem('next_to_move', data.next_to_move); // Storing the player ID in local storage
        localStorage.setItem('players', JSON.stringify(data.players)); // Storing the player ID in local storage

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
