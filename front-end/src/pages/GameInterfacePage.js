import React, { useEffect, useState } from "react";
import monster1 from "../images/monster_1.webp";
import monster2 from "../images/monster_2.webp";
import battle_arena from "../images/battle_arena.jpg";

function GameInterface() {
  const [paragraph, setParagraph] = useState("");
  const [question, setQuestion] = useState({});
  const [monster1Data, setMonster1Data] = useState({});
  const [monster2Data, setMonster2Data] = useState({});

  const [actions, setActions] = useState([
    { name: "Attack", points: 5 },
    { name: "Heal", points: 10 },
  ]);

  const [pointsAvailable, setPointsAvailable] = useState(20);

  const fetchParagraph = async () => {
    // Replace with actual API call
    const paragraphData = "This is a sample paragraph from the mock API.";
    setParagraph(paragraphData);
  };

  const fetchQuestion = async () => {
    // Replace with actual API call
    const questionData = {
      text: "Sample Question: Which of the following is true?",
      options: ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
    };
    setQuestion(questionData);
  };

  const fetchMonsterData = async (monsterNumber) => {
    // Replace with actual API call
    const data = {
      health: "100%",
      name: monsterNumber === 1 ? "Kraken" : "Leviathan",
    };
    if (monsterNumber === 1) {
      setMonster1Data(data);
    } else {
      setMonster2Data(data);
    }
  };

  const fetchActions = async () => {
    // Replace with actual API call
    const actionsData = [
      { name: "Attack", points: 5 },
      { name: "Heal", points: 10 },
      // Add more actions as needed
    ];
    setActions(actionsData);
  };

  useEffect(() => {
    fetchParagraph();
    fetchQuestion();
    fetchMonsterData(1);
    fetchMonsterData(2);
    fetchActions();
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
            className="px-4 py-2 rounded-lg shadow bg-green-500 hover:bg-green-600 text-white">
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

      <div className="col-span-2 bg-blue-100 rounded-lg shadow p-4 mt-4">
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
                /* handle action click */
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
