import React, { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const StartGamePage = () => {
  const [gameNumber, setGameNumber] = useState('12345'); // Santi generate it dinamitacally with the backend API
  const [hasJoined, setHasJoined] = useState(false); // Santi get this value from the backend API
  const navigate = useNavigate();
  const handleStartGame = () => {
    // Make a request to the server to start the game
    // navigate(`/game/${gameNumber}`); for example
    console.log('Game started');
    navigate('/game');
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
          // disabled={!hasJoined} // Santi enable this button dinamically with the backend API

        >
          <FiPlay className="mr-2" />
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartGamePage;
