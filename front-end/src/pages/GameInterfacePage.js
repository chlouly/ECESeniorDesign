import React, { useEffect, useState } from "react";
import monster1 from "../images/monster_1.webp";
import monster2 from "../images/monster_2.webp";
import battle_arena from "../images/battle_arena.jpg";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

function GameInterface() {
  const [players, setPlayers] = useState(() => {
    const storedPlayers = localStorage.getItem("players");
    return storedPlayers ? JSON.parse(storedPlayers) : [];
  });
  const [to_move, setToMove] = useState(() => {
    const storedToMove = localStorage.getItem("to_move");
    return storedToMove ? parseInt(storedToMove, 10) : null;
  });
  const [next_to_move, setNextToMove] = useState(() => {
    const storedNextToMove = localStorage.getItem("next_to_move");
    return storedNextToMove ? parseInt(storedNextToMove, 10) : null;
  });
  const [gameNumber, setGameNumber] = useState(
    window.location.pathname.split("/").pop()
  );
  const [id, setId] = useState(() => {
    const storedId = localStorage.getItem("user_id");
    return storedId ? parseInt(storedId, 10) : null;
  });
  const [playerIndex, setPlayerIndex] = useState(null);
  const [otherPlayerIndex, setOtherPlayerIndex] = useState(null);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const navigate = useNavigate();
  const [actions, setActions] = useState([
    { name: "Attack", api_name: 0 },
    { name: "Heal", api_name: 1 },
    { name: "Swap", api_name: 2 },
  ]);
  const [paragraphData, setParagraphData] = useState({
    paragraph: "",
    question: {
      text: "",
      options: [],
    },
    correct_answer: "",
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
        gameNumber: parseInt(gameNumber),
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("paragraph_data");
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
            correct_answer: data.question.correct_answer,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleActionClick = (action, m_id) => {
    let user_ID = localStorage.getItem("user_id");
    user_ID = parseInt(user_ID, 10);
    console.log(paragraphData)
    fetch("/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user_ID,
        gameNumber: parseInt(gameNumber),
        action: action,
        m_id: m_id,
        corr_ans: paragraphData.correct_answer,
        chosen_ans: chosenAnswer
      }),
    })
      .then((response) => {
        if (response.status === 220) {
          setChosenAnswer(null);
          return response.json();
        }else if (response.status === 221) {
          setChosenAnswer(null);
          alert("Wrong Answer!");
          return response.json();
        }
        
        else {
          console.error("Not response 200");
          throw new Error("Failed to perform action");
        }
      })
      .then((data) => {
        console.log("Action performed successfully");
        console.log(data);
        setPlayers(data.players);
        localStorage.setItem("players", JSON.stringify(data.players));
        setToMove(data.to_move);
        localStorage.setItem("to_move", data.to_move);
        setNextToMove(data.next_to_move);
        localStorage.setItem("next_to_move", data.next_to_move);
        localStorage.removeItem("paragraph_data");
        getNewParagraph();
        handleWaitForOtherPlayer();
      })
      .catch((error) => {
        alert(error);
        console.error(error);
      });
    // setTimeout(() => {
    //   handleWaitForOtherPlayer();
    // }, 15000);
  };
  const handleWaitForOtherPlayer = () => {
    let user_ID = localStorage.getItem("user_id");
    user_ID = parseInt(user_ID, 10);

    // Create an AbortController instance
    const controller = new AbortController();
    const signal = controller.signal;

    // Set a timeout to abort the fetch request after 5 minutes
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 300,000 ms = 5 minutes

    fetch("/waittomove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: user_ID, gameNumber: parseInt(gameNumber) }),
      signal: signal  // Pass the abort signal to the fetch call
    })
      .then((response) => {
        clearTimeout(timeoutId); // Clear the timeout on receiving a response

        if (response.status === 210) {
          console.log("Other player has moved");
          return response.json(); // Parse JSON only if the status is 210
        } else if (response.status === 555) {
          console.log("No move yet, polling again...");
          handleWaitForOtherPlayer(); // Recursive call to wait again
        } else {
          console.error("Unexpected response status:", response.status);
          throw new Error("Failed to wait for other player");
        }
      })
      .then((data) => {
        if (data) {
          console.log("Move data received:", data);
          setPlayers(data.players);
          localStorage.setItem("players", JSON.stringify(data.players));
          setToMove(data.to_move);
          localStorage.setItem("to_move", data.to_move);
          setNextToMove(data.next_to_move);
          localStorage.setItem("next_to_move", data.next_to_move);

        }
      })
      .catch((error) => {
        clearTimeout(timeoutId); // Ensure to clear the timeout if an error occurs
        if (error.name === "AbortError") {
          console.error("Fetch aborted due to timeout");
          // alert("Request timed out. Please try again.");
          handleWaitForOtherPlayer(); // Recursive call to wait again
        } else {
          // alert(error);
          console.error("Fetch error:", error);
          handleWaitForOtherPlayer(); // Recursive call to wait again
        }
      });
  };


  useEffect(() => {
    if (players.length > 0 && id !== null) {
      const foundIndex = players.findIndex((player) => player.id === id);
      const foundOtherIndex = players.findIndex((player) => player.id !== id);
  
      setPlayerIndex(foundIndex >= 0 ? foundIndex : null);
      setOtherPlayerIndex(foundOtherIndex >= 0 ? foundOtherIndex : null);
    }
  }, [players, id]);

  useEffect(() => {
    try {

      if (localStorage.getItem("paragraph_data")) {
        const data = JSON.parse(localStorage.getItem("paragraph_data"));
        setParagraphData({
          paragraph: data.paragraph,
          question: {
            text: data.question.text,
            options: data.question.options,
          },
          correct_answer: data.question.correct_answer,
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
      <div className="bg-blue-100 rounded-lg col-span-1 row-span-3 shadow p-4 flex flex-col h-full">
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
                className={`px-4 py-2 rounded-lg shadow hover:bg-blue-500 text-white text-md text-left ${ chosenAnswer !== option[0] ? 'bg-green-500' : 'bg-blue-600'}`}
                onClick={() => setChosenAnswer(option[0])}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Monster 1 Section */}
      <div className="flex col-span-1 row-span-2 flex-col items-center  justify-center">
        <img
          src={monster1}
          alt="Monster 1"
          className="object-cover rounded-lg shadow"
        />
        <div className="bg-blue-100 rounded-lg shadow p-2 text-center mt-2 w-full">
          
          { players.length > 0 && players[playerIndex] != null  && players[playerIndex].current_monster != null ? (
            <>
            <p className="text-blue-800 font-semibold">Your Monster: {players[playerIndex].current_monster.name}</p>
              {/* <p className="text-blue-700"></p> */}
              <p className="text-blue-700">Level: {players[playerIndex].current_monster.level}</p>
              <p className="text-blue-700">XP: {players[playerIndex].current_monster.xp}</p>
              <p className="text-blue-700">Health: {players[playerIndex].current_monster.health}</p>
            </>
          ) : (
            <ClipLoader color={"#000"} loading={true} size={50} />
          )}
        </div>
      </div>
      {/* MENU */}
      <div className="col-span-2 bg-blue-100 rounded-lg shadow p-4 mt-4 relative">
        <div className="flex divide-x divide-blue-300">
          {/* Player Stats Section */}
          <div className="flex-1 p-2">
            <p className="text-blue-800 font-semibold mb-2">Player Stats:</p>
            {players.length > 0 && players[playerIndex] != null && (
              <>
                <p className="text-blue-700">{players[playerIndex].name}</p>
                <p className="text-blue-700">Level: {players[playerIndex].level}</p>
                <p className="text-blue-700">XP: {players[playerIndex].xp}</p>
              </>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex-1 p-2">
            <p className="text-blue-800 font-semibold mb-2">Choose an action:</p>
            <div className="flex flex-wrap justify-center items-center">


              {to_move === id ? (
                <>
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 m-1 rounded-lg shadow bg-green-500 hover:bg-green-600 text-white w-1/3"
                      onClick={() => handleActionClick(action.api_name, players[playerIndex].current_monster.id)}
                    >
                      {action.name}
                    </button>
                  ))}
                </>) : (
                <p className="text-blue-700">Wait Opponent's Turn</p>
              )}


            </div>
          </div>
        </div>

        {/* Monsters Section */}
        <div className="flex flex-row space-x-4 mt-4 justify-center">
        {players.length > 0 && players[playerIndex] != null && players[playerIndex].monsters_roster != null ? (
        <div className="flex justify-between items-center space-y-2">

          {players[playerIndex].monsters_roster.map((monsterIndex) => (
            <div key={monsterIndex} className="text-center">
              <p>Monster Index: {monsterIndex}</p>
              {/* Uncomment below to add more details if available */}
              {/* <img src={monster.image} alt={`Monster ${monster.name}`} className="object-cover rounded-lg shadow" />
              <p className="text-blue-700">{monster.name}</p> */}
            </div>
          ))}
        </div>
      ) : (
        <>
        <ClipLoader color={"#000"} loading={true} size={50} />
        <p className="text-blue-700">Loading Monster...</p>
      </>
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
              
              {players.length > 1 && players[otherPlayerIndex] != null && players[otherPlayerIndex].current_monster != null ? (
                <>
                <p className="text-blue-800 font-semibold">Opponent Monster: {players[otherPlayerIndex].current_monster.name}</p>
                  {/* <p className="text-blue-700"></p> */}
                  <p className="text-blue-700">Level: {players[otherPlayerIndex].current_monster.level}</p>
                  <p className="text-blue-700">XP: {players[otherPlayerIndex].current_monster.xp}</p>
                  <p className="text-blue-700">Health: {players[otherPlayerIndex].current_monster.health}</p>
                </>
              ) : (
                <ClipLoader color={"#000"} loading={true} size={50} />
              )}
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
