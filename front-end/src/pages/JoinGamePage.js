import React, { useState } from "react";
import { FiLogIn } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
const JoinGamePage = () => {
  const [gameNumber, setGameNumber] = useState("");
  const navigate = useNavigate();
  const handleJoinGame = () => {
    const gameNumberInt = parseInt(gameNumber, 10);
    console.log(gameNumberInt);
    // Make a request to the server to join the game
    fetch("/joingame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: 2, gameNumber: gameNumberInt }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.error("Not response 200");
          throw new Error("Failed to join game");
        }
      })
      .then((data) => {
        console.log(data);
        localStorage.setItem('gameNumber', data.gameNumber); // Storing the game number in local storage
        localStorage.setItem('to_move', data.to_move); // Storing the player ID in local storage
        localStorage.setItem('next_to_move', data.next_to_move); // Storing the player ID in local storage
        localStorage.setItem('players', JSON.stringify(data.players)); // Storing the player ID in local storage
        console.log(data.players);
        navigate(`/game/${gameNumber}`);
      })
      .catch((error) => {
        alert(error);
        console.error(error);
      });
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
