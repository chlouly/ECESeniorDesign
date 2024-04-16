import React from "react";
import { FiPlayCircle, FiUsers, FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      <div className="text-4xl font-bold text-blue-800 mb-10">
        Welcomew to SAT Monster Battle!
      </div>
      <Link
        to="/start"
        className="flex items-center justify-center w-64 px-6 py-3 mb-4 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <FiPlayCircle className="mr-2" />
        Start Game
      </Link>
      <Link
        to="/join"
        className="flex items-center justify-center w-64 px-6 py-3 mb-4 text-white bg-green-500 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        <FiUsers className="mr-2" />
        Join Game
      </Link>
      <Link
        to="/joinrandom"
        className="flex items-center justify-center w-64 px-6 py-3 mb-4 text-white bg-green-500 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        <FiUsers className="mr-2" />
        Join Random Game
      </Link>
      <Link
        to="/settings"
        className="flex items-center justify-center w-64 px-6 py-3 mb-4 text-white bg-yellow-500 rounded-md shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
      >
        <FiSettings className="mr-2" />
        Settings
      </Link>
      <Link
        to="/upload"
        className="flex items-center justify-center w-64 px-6 py-3 mb-4 text-white bg-red-500 rounded-md shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
      >
        <FiUsers className="mr-2" />
        Upload PDF
      </Link>
    </div>
  );
};

export default Home;
