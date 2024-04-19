import React, { useEffect, useState } from "react";
import monster1 from "../images/monster_1.webp";
import monster2 from "../images/monster_2.webp";
import battle_arena from "../images/battle_arena.jpg";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

function GameInterface() {
  const [players, setPlayers] = useState([]);
  const [to_move, setToMove] = useState(0);
  const [next_to_move, setNextToMove] = useState(0);
  const [gameNumber, setGameNumber] = useState(window.location.pathname.split("/").pop());
  const navigate = useNavigate();
  const [actions, setActions] = useState([
    { name: "Attack"},
    { name: "Heal"},
  ]);
  const [paragraphData, setParagraphData] = useState({
    paragraph: "",
    question: {
      text: "",
      options: [],
    },
  });

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
    })
      .then((response) => {
        if (response.status === 200) {
          navigate("/");
        } else {
          console.error("Not response 200");
          throw new Error("Failed to leave game");
        }
      })
      .catch((error) => {
        alert(error);
        console.error(error);
      });
  };
  const getNewParagraph = () => {
    fetch("/randomparagraph")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Failed to fetch data:", data.error);
        } else {
          localStorage.setItem('paragraph_data', JSON.stringify(data));

          setParagraphData({
            paragraph: data.paragraph,
            question: {
              text: data.question.text,
              options: data.question.options,
            },
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
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
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.error("Not response 200");
          throw new Error("Failed to perform action");
        }
      })
      .then((data) => {
        console.log("Action performed successfully");
        console.log(data);
        localStorage.removeItem('paragraph_data');
        getNewParagraph();
      })
      .catch((error) => {
        alert(error);
        console.error(error);
      });
    setTimeout(() => {
      handleWaitForOtherPlayer();
    }, 15000);

  };
  const handleWaitForOtherPlayer = () => {
    fetch("/waittomove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: 1, gameNumber: gameNumber }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.error("Not response 200");
          throw new Error("Failed to wait for other player");
        }
      })
      .then((data) => {
        // Data should have the format { gameData: YOUR_GAME_DATA }
        console.log("Other player has moved");
        console.log(data);
      })
      .catch((error) => {
        alert(error);
        console.error(error);
      });
  };

  useEffect(() => {
    
    setPlayers(localStorage.getItem('players').split(','));
    setToMove(localStorage.getItem('to_move'));
    setNextToMove(localStorage.getItem('next_to_move'));
    if (localStorage.getItem('paragraph_data')) {
      const data = JSON.parse(localStorage.getItem('paragraph_data'));
      setParagraphData({
        paragraph: data.paragraph,
        question: {
          text: data.question.text,
          options: data.question.options,
        },
      });
    } else {
      getNewParagraph();
    }
    setTimeout(() => {
      handleWaitForOtherPlayer();
    }, 15000);

  }, []);

  return (
    <div
      className="bg-cover h-screen grid grid-rows-3 grid-flow-col grid grid-cols-3 grid_flow_col gap-4 p-4"
      style={{ backgroundImage: `url(${battle_arena}), height: 100vh` }}
    >
      <div className="row-span-2 bg-blue-100 rounded-lg shadow p-4">
        <p className="text-blue-800 font-semibold">{paragraphData.paragraph}</p>
      </div>

      <div className="bg-blue-100 rounded-lg shadow p-4 mt-4">
        <p className="text-blue-800 font-semibold">
          {paragraphData.question.text}
        </p>
        <div className="text-blue-700 flex flex-col mt-2 space-y-2">
          {paragraphData.question.options?.map((option, index) => (
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
            HEALTH: 100
          </p>
          <p className="text-blue-700">{players[0].name}</p>
        </div>
      </div>

      {/* MENU */}

      <div className="col-span-2 bg-blue-100 rounded-lg shadow p-4 mt-4 relative">
        <p className="text-blue-800 font-semibold mb-2">Choose an action:</p>
        <div className=" items-center space-x-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg shadow bg-green-500 hover:bg-green-600" text-white`}
              onClick={() => {
                handleActionClick(action);
              }}
            >
              {action.name}
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 right-0 bg-white p-4 rounded-lg shadow space-y-4">
          <p className="text-gray-800 font-semibold">
            Game Number: {gameNumber}
          </p>
          <button
            className="px-4 py-2 rounded-lg shadow bg-red-500 hover:bg-red-600 text-white"
            onClick={handleLeaveGame}
          >
            Leave Game
          </button>
        </div>
      </div>
      
      <div className="flex flex-col col-span-1 row-span-2 items-center">
      { players.length > 1 ? <>
        <img
          src={monster2}
          alt="Monster 2"
          className="w-full object-cover rounded-lg shadow"
        />
        <div className="bg-blue-100 rounded-lg shadow p-2 text-center mt-2">
          <p className="text-blue-800 font-semibold">
            HEALTH: 100
          </p>
          {/* <p className="text-blue-700">{gameData[1].name}</p> */}
        </div></>
        : <>
        <ClipLoader color={"#000"} loading={true} size={50} />
        <p className="text-blue-800 font-semibold">Waiting for other player...</p>
        </> } 
      </div>
      
    </div>
  );
}

export default GameInterface;
