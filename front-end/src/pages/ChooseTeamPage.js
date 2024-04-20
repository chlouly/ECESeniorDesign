import React, { useState, useEffect } from "react";

const ChooseTeamPage = () => {
  const [team, setTeam] = useState("");
  const [monsters, setMonsters] = useState([]);

  useEffect(() => {
    fetchMonsters();
  }, []);

  const fetchMonsters = async () => {
    const access_token = localStorage.getItem("access_token");
    try {
      const response = await fetch("/monsterdata", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`, // Include the access token in the Authorization header
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMonsters(data);
      } else {
        console.error("Failed to fetch monsters");
      }
    } catch (error) {
      alert("Failed to fetch monsters");
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      <h1 className="text-4xl font-bold text-blue-800 mb-10">Here is your team!</h1>
      <div className="text-2xl font-bold text-blue-800 mb-10">
        Monsters
      </div>
      <div>
        <ul>
          {monsters.length === 0 ? (
            <p>No monsters found</p>
          ) : (
            monsters.map((monster) => (
              <div key={monster.id} className="flex flex-col items-center mb-4 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{monster.name}</h3>
                <p>Level: {monster.level}</p>
                <p>XP: {monster.xp}</p>
                <p>Type: {monster.type}</p>
              </div>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ChooseTeamPage;
