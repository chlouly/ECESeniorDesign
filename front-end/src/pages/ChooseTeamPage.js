import React, { useState, useEffect } from "react";

function generateImageUrl (index) {
  return `https://seniordesign-s3.s3.amazonaws.com/${index}.png`
}

const ChooseTeamPage = () => {
  const [team, setTeam] = useState("");
  const [bench, setBench] = useState([]);
  const [roster, setRoster] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState();
  const [selectedBench, setSelectedBench] = useState();
  const [user_ID, setUser_ID] = useState(parseInt(localStorage.getItem("user_id"), 10));

  useEffect(() => {
    fetchMonsters();
  }, []);

  const fetchMonsters = async () => {
    
    try {
      fetch("/playerdata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user_ID }),
      }).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.error("Not response 200");
          throw new Error("Failed to fetch monsters");
        }
      }
      ).then((data) => {
        // setRoaster(data.monsters_roaster);
        // console.log(data);
        setBench(data.monsters_bench);
        setRoster(data.monsters_roster);
        console.log(bench);
        console.log(roster);
      }).catch((error) => {
        console.error(error);
      });
    }
    catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      <h1 className="text-4xl font-bold text-blue-800 mb-10">Here is your team!</h1>

      <div>
        {/* Create two columns with with a button between. On the left show roster and map the list, on the right hand show bench and map displaying indexes. Display both sidex verticaly */}
        <div className="flex flex-row justify-between items-center p-4">
  <div className="flex flex-col space-y-4 mr-10">
    <h2 className="text-2xl font-bold text-blue-800">Here is your roster</h2>
    {roster && roster.map((index) => (
      <div key={index} className="flex justify-center items-center">
        <button
          className={`rounded-full focus:outline-none ${selectedRoster === index ? "border-4 border-blue-500" : "border-2 border-transparent"}`}
          onClick={() => {
            setSelectedRoster(index);
          }}
        >
          <img 
            className="w-20 h-20 rounded-full"
            src={generateImageUrl(index % 20)} alt="Monster" />
        </button>
      </div>
    ))}
  </div>
  <button
    className="mx-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    Swap Monsters
  </button>

  <div className="flex flex-col space-y-4 ml-10">
    <h2 className="text-2xl font-bold text-blue-800">Here is your bench</h2>
    {bench && bench.map((index) => (
      <div key={index} className="flex justify-center items-center">
        <button
          className={`focus:outline-none ${selectedBench === index ? "border-4 border-blue-500" : "border-2 border-transparent"}`}
          onClick={() => {
            setSelectedBench(index);
          }}
        >
          <img 
            className="w-20 h-20 rounded-full"
            src={generateImageUrl(index % 20)} alt="Monster" />
        </button>
      </div>
    ))}
  </div>
</div>



      </div>
    </div>
  );
};

export default ChooseTeamPage;
