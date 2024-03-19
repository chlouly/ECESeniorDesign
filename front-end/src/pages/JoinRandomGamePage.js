import React, { useState } from "react";
import { FiLogIn } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
const JoinGamePage = () => {
  const [gameNumber, setGameNumber] = useState("");
  const navigate = useNavigate();
  const handleJoinGame = () => {
    // Make a request to the server to join random the game
    // Wait for the server to return the game number
    // navigate(`/game/${gameNumber}`); for example
    // gameNumber is returned from the server

    navigate(`/game`);
    console.log(`Joining game: ${gameNumber}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100 p-4">
      <div className="text-3xl font-bold text-blue-800 mb-8">Join Game</div>

      {/* Input for Game Number */}
      <div className="flex flex-col items-center mb-6">
        <input
          type="text"
          value={gameNumber}
          onChange={(e) => setGameNumber(e.target.value)}
          className="w-full max-w-xs px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter 5-digit game number"
          maxLength="5"
        />

        {/* Join Button */}
        <button
          className="flex items-center justify-center px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          onClick={handleJoinGame}
          disabled={gameNumber.length !== 5}
        >
          <FiLogIn className="mr-2" />
          Join Game
        </button>
      </div>
    </div>
  );
};

export default JoinGamePage;
