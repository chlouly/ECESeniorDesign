import React, { useEffect, useState } from "react";
import monster1 from "../images/monster_1.webp";
import monster2 from "../images/monster_2.webp";
import battle_arena from "../images/battle_arena.jpg";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

function GameInterface() {
  console.log("GameInterface");
  const [players, setPlayers] = useState([]);
  const [to_move, setToMove] = useState(0);
  const [next_to_move, setNextToMove] = useState(0);
  const [gameNumber, setGameNumber] = useState(
    window.location.pathname.split("/").pop()
  );
  const navigate = useNavigate();
  const [actions, setActions] = useState([
    { name: "Attack" },
    { name: "Heal" },
    { name: "Swap" },
  ]);
  const [paragraphData, setParagraphData] = useState({
    paragraph: "",
    question: {
      text: "",
      options: [],
    },
  });

  const handleLeaveGame = () => {
    let user_ID = localStorage.getItem("user_id");
    user_ID = parseInt(user_ID, 10);
    fetch("/leavegame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user_ID,
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
          localStorage.setItem("paragraph_data", JSON.stringify(data));

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
    let user_ID = localStorage.getItem("user_id");
    user_ID = parseInt(user_ID, 10);
    fetch("/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user_ID,
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
        localStorage.removeItem("paragraph_data");
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
    let user_ID = localStorage.getItem("user_id");
    user_ID = parseInt(user_ID, 10);
    fetch("/waittomove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: user_ID, gameNumber: gameNumber }),
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
        console.log("Other player has moved");
        console.log(data);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.error("Fetch aborted due to timeout");
          alert("Request timed out. Please try again.");
        } else {
          alert(error.message);
          console.error(error);
        }
      });
  };

  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem("players");
      if (storedPlayers) {
        const parsedPlayers = JSON.parse(storedPlayers);
        setPlayers(parsedPlayers);
        console.log("Parsed Players:", parsedPlayers);
      }

      const toMove = localStorage.getItem("to_move");
      setToMove(toMove);
      console.log("To Move:", to_move);

      const nextToMove = localStorage.getItem("next_to_move");
      setNextToMove(nextToMove);
      console.log("Next to Move:", next_to_move);

      if (localStorage.getItem("paragraph_data")) {
        const data = JSON.parse(localStorage.getItem("paragraph_data"));
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

      handleWaitForOtherPlayer();
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  return (
    <div
      className="bg-cover h-screen grid grid-rows-3 grid-flow-col grid grid-cols-3 grid_flow_col gap-4 p-4"
      style={{ backgroundImage: `url(${battle_arena}), height: 100vh` }}
    >
      <div className="bg-blue-100 rounded-lg row-span-2 shadow p-4 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-blue-800 font-semibold text-left text-xl">
            Paragraph:
          </p>
          <p className="text-blue-800 font-normal mt-4 text-left whitespace-pre-line">
            {paragraphData.paragraph}
          </p>
        </div>
        <div className="divider"></div> {/* This is the divider line */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-blue-800 font-semibold text-left text-xl">
            Question:
          </p>
          <p className="text-blue-800 font-normal mt-4 text-left">
            {paragraphData.question.text}
          </p>
          <div className="text-blue-700 flex flex-col mt-4 space-y-2 text-left">
            {paragraphData.question.options?.map((option, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-lg shadow bg-green-500 hover:bg-green-600 text-white text-md text-left"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Monster 1 Section */}
      <div className="flex col-span-1 row-span-2 flex-col items-center justify-center">
        <img
          src={monster1}
          alt="Monster 1"
          className="object-cover rounded-lg shadow"
        />
        <div className="bg-blue-100 rounded-lg shadow p-2 text-center mt-2 w-full">
          <p className="text-blue-800 font-semibold">HEALTH: 100</p>
          {players.length > 0 ? (
            <>
              <p className="text-blue-700">{players[0].name}</p>
              <p className="text-blue-700">Level: {players[0].level}</p>
              <p className="text-blue-700">XP: {players[0].xp}</p>
            </>
          ) : (
            <ClipLoader color={"#000"} loading={true} size={50} />
          )}
        </div>
      </div>
      {/* MENU */}
      <div className="col-span-2 bg-blue-100 rounded-lg shadow p-4 mt-4 relative">
        <p className="text-blue-800 font-semibold mb-2">Choose an action:</p>
        <div className=" items-center space-x-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg shadow bg-green-500 hover:bg-green-600" text-white w-1/5`}
              onClick={() => {
                handleActionClick(action);
              }}
            >
              {action.name}
            </button>
          ))}
        </div>
        {/* Display five monter in a row from players[0].monster_bench */}
        <div className="flex flex-row space-x-4 mt-8 justify-center">
          {players.length > 0 && players[0].monster_bench != null ? (
            players[0].monster_bench.map((monster, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                {monster == null ? (
                  <>
                    <img
                      src={monster1}
                      alt="Monster 1"
                      className="object-cover rounded-lg shadow"
                    />
                    <p className="text-blue-700">{monster.name}</p>
                    <p className="text-blue-700">Level: {monster.level}</p>
                    <p className="text-blue-700">XP: {monster.xp}</p>
                    <p className="text-blue-700">Health: {monster.health}</p>
                    <p className="text-blue-700">Type: {monster.type}</p>
                  </>
                ) : (
                  <>
                    <ClipLoader color={"#000"} loading={true} size={50} />
                    <p className="text-blue-700">Loading Monster...</p>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <ClipLoader color={"#000"} loading={true} size={50} />
              <p className="text-blue-700">Loading Monsters...</p>
            </div>
          )}
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
      <div className="flex flex-col col-span-1 row-span-2 items-center justify-center">
        {players.length > 1 ? (
          <>
            <img
              src={monster2}
              alt="Monster 2"
              className="object-cover rounded-lg shadow"
            />
            <div className="bg-blue-100 rounded-lg shadow p-2 text-center mt-2 w-full">
              <p className="text-blue-800 font-semibold">HEALTH: 100</p>
              <p className="text-blue-700">{players[1].name}</p>
              <p className="text-blue-700">Level: {players[1].level}</p>
              <p className="text-blue-700">XP: {players[1].xp}</p>
            </div>
          </>
        ) : (
          <>
            {" "}
            <ClipLoader color={"#000"} loading={true} size={50} />
            <p className="text-blue-800 font-semibold">
              {" "}
              Waiting for other player to join...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default GameInterface;
