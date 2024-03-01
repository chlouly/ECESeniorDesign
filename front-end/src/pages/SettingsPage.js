import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';

const Settings = () => {
  const [username, setUsername] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const handleSaveSettings = () => {
    // Make API request to save settings
    console.log(`Saving settings: Username - ${username}, Difficulty - ${difficulty}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100 p-4">
      <div className="text-3xl font-bold text-blue-800 mb-8">Settings</div>
      
      {/* Username Input */}
      <div className="flex flex-col items-start w-full max-w-md mb-6">
        <label htmlFor="username" className="mb-2 text-lg">Username</label>
        <input 
          type="text" 
          id="username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your username"
        />
      </div>

      {/* Difficulty Select */}
      <div className="flex flex-col items-start w-full max-w-md mb-8">
        <label htmlFor="difficulty" className="mb-2 text-lg">Difficulty Level</label>
        <select 
          id="difficulty" 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Save Button */}
      <button 
        className="flex items-center justify-center w-full max-w-md px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        onClick={handleSaveSettings}
      >
        <FiSave className="mr-2" />
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
