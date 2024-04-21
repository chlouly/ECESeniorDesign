import React, { useEffect } from "react";
import { FiPlayCircle, FiUsers, FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const HomeMenu = () => {
  const navigate = useNavigate();
  const handleNewUser = async () => {
    const access_token = localStorage.getItem("access_token");
    try {
      const response = await fetch("/new_user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`, // Include the access token in the Authorization header
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      localStorage.setItem("user_id", data.user_id);
    } catch (error) {
      console.error("Error fetching data:", error);
      // remove tokens and redirect to login
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  useEffect(() => {
    handleNewUser();
  }, []);

  const handleLogout = () => {
    const access_token = localStorage.getItem("access_token");

    try {
      const response = fetch("/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response === 200) {
        console.log("Logged out");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    // Clear local authentication state
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("isAuthenticated");

    window.location.href = `https://pokidips.auth.us-east-1.amazoncognito.com/logout?client_id=6ke1tj0bnmg6ij6t6354lfs30q&logout_uri=https%3A%2F%2Fpokidips.games/login&redirect_uri=https%3A%2F%2Fpokidips.games/login`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      <div className="text-4xl font-bold text-blue-800 mb-10">PokiDips</div>
      <div className="text-2xl font-bold text-blue-800 mb-10">
        Welcome to our SAT Monster Battle! Please select an option below.
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
        to="/choose"
        className="flex items-center justify-center w-64 px-6 py-3 mb-4 text-white bg-green-500 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        <FiUsers className="mr-2" />
        Choose your team
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
      <button
        onClick={handleLogout}
        className="flex items-center justify-center w-64 px-6 py-3 mb-4 text-white bg-red-500 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        Logout
      </button>
    </div>
  );
};

export default HomeMenu;
