import React, { useEffect, useState } from "react";
import monster1 from "../images/monster_1.webp";
import monster2 from "../images/monster_2.webp";
import battle_arena from "../images/battle_arena.jpg";
import { useNavigate } from "react-router-dom";

function GameInterface() {
  const [paragraph, setParagraph] = useState("");
  const [question, setQuestion] = useState({});
  const [monster1Data, setMonster1Data] = useState({});
  const [monster2Data, setMonster2Data] = useState({});
  const [gameNumber, setGameNumber] = useState(""); 
  const navigate = useNavigate();
  const [actions, setActions] = useState([
    { name: "Attack", points: 5 },
    { name: "Heal", points: 10 },
  ]);

  const [pointsAvailable, setPointsAvailable] = useState(20);

  const handleLeaveGame = () => {
    fetch("/leavegame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        gameNumber: gameNumber,
      }),
    }).then((response) => {
      if (response.status === 200) {
        navigate("/");
      } else {
        console.error("Not response 200");
        throw new Error("Failed to leave game");
      }
    }).catch((error) => {
      alert(error);
      console.error(error);
    });
  };


  const fetchInitialGameData = async () => {
    // Replace with actual API call
    const gameData = {
      paragraph: "This is a sample paragraph from the mock API.",
      question: {
        text: "Sample Question: Which of the following is true?",
        options: ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
      },
      monster1: {
        name: "Monster 1",
        health: 100,
      },
      monster2: {
        name: "Monster 2",
        health: 100,
      },
    };

    setParagraph(gameData.paragraph);
    setQuestion(gameData.question);
    setMonster1Data(gameData.monster1);
    setMonster2Data(gameData.monster2);
  };

  const handleActionClick = (action) => {
    fetch("/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        gameNumber: gameNumber,
        action: action,
        m_id: 1,
      }),
    }).then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        console.error("Not response 200");
        throw new Error("Failed to perform action");
      }
    }).then((data) => {
      // Data should have the format { gameData: YOUR_GAME_DATA }
      setMonster1Data(data.monster1);
      setMonster2Data(data.monster2);
      setPointsAvailable(data.pointsAvailable);
    }).catch((error) => {
      alert(error);
      console.error(error);
    });

    // Make a new API call to wait for the other player. Time out after 15 seconds.
    setTimeout(() => {
      handleWaitForOtherPlayer();
    }, 15000);

    // I will also get game data back from the server
  };
  const handleWaitForOtherPlayer = () => {

    fetch('/waittomove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 1, gameNumber: gameNumber })
    })
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.error('Not response 200');
          throw new Error('Failed to wait for other player');
        }
      })
      .then(data => {
        // Data should have the format { gameData: YOUR_GAME_DATA }
        setMonster1Data(data.monster1);
        setMonster2Data(data.monster2);
        setPointsAvailable(data.pointsAvailable);
      })
      .catch(error => {
        alert(error);
        console.error(error);
      });
      
    // Replace with actual API call
    // Post, WaitForOtherPlayer
    // Gamenumber
    // PlayerNumber

    // I will also get game data back from the server
  };

  useEffect(() => {
    let gameNumber = window.location.pathname.split("/").pop();
    console.log(gameNumber);

    setGameNumber(gameNumber);
    fetchInitialGameData();

  }, []);


  return (
    <div
      className="bg-cover h-screen grid grid-rows-3 grid-flow-col grid grid-cols-3 grid_flow_col gap-4 p-4"
      style={{ backgroundImage: `url(${battle_arena}), height: 100vh` }}
    >
      <div className="row-span-2 bg-blue-100 rounded-lg shadow p-4">
        <p className="text-blue-800 font-semibold">{paragraph}</p>
      </div>

      <div className="bg-blue-100 rounded-lg shadow p-4 mt-4">
        <p className="text-blue-800 font-semibold">{question.text}</p>
        <div className="text-blue-700 flex flex-col mt-2 space-y-2">
          {question.options?.map((option, index) => (
            <button
              key={index}
              className="px-4 py-2 rounded-lg shadow bg-green-500 hover:bg-green-600 text-white"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Monster 1 Section */}

      <div className="flex col-span-1 row-span-2 flex-col items-center">
        <img
          src={monster1}
          alt="Monster 1"
          className="w-full object-cover rounded-lg shadow"
        />
        <div className="bg-blue-100 rounded-lg shadow p-2 text-center mt-2">
          <p className="text-blue-800 font-semibold">
            HEALTH: {monster1Data.health}
          </p>
          <p className="text-blue-700">{monster1Data.name}</p>
        </div>
      </div>

      {/* MENU */}

      <div className="col-span-2 bg-blue-100 rounded-lg shadow p-4 mt-4 relative">
        <p className="text-blue-800 font-semibold mb-2">Choose an action:</p>
        <div className=" items-center space-x-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg shadow ${
                pointsAvailable >= action.points
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500"
              } text-white`}
              onClick={() => {
                handleActionClick(action);
              }}
              disabled={pointsAvailable < action.points}
            >
              {action.name} (-{action.points} pts)
            </button>
          ))}
        </div>
        <p className="text-blue-800 font-semibold mt-4">
          Points Available: {pointsAvailable}
        </p>
        <div className="absolute bottom-0 right-0 bg-white p-4 rounded-lg shadow space-y-4">
          <p className="text-gray-800 font-semibold">Game Number: {gameNumber}</p>
          <button
            className="px-4 py-2 rounded-lg shadow bg-red-500 hover:bg-red-600 text-white"
            onClick={handleLeaveGame}
          >
            Leave Game
          </button>
        </div>
      </div>

      <div className="flex flex-col col-span-1 row-span-2 items-center">
        <img
          src={monster2}
          alt="Monster 2"
          className="w-full object-cover rounded-lg shadow"
        />
        <div className="bg-blue-100 rounded-lg shadow p-2 text-center mt-2">
          <p className="text-blue-800 font-semibold">
            HEALTH: {monster2Data.health}
          </p>
          <p className="text-blue-700">{monster2Data.name}</p>
        </div>
      </div>
    </div>
  );
}

export default GameInterface;
