import { render, screen } from '@testing-library/react';

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomeMenu from './pages/HomeMenuPage'; // Adjust the import path as necessary

// Mock local storage for authentication
const mockLocalStorage = () => {
  const storage = {};
  return {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => (storage[key] = value.toString()),
    removeItem: (key) => delete storage[key],
    clear: () => (storage = {})
  };
};

// Mocking the local storage and setting an access token
global.localStorage = mockLocalStorage();
localStorage.setItem("access_token", "fake-access-token");

describe('HomeMenu Component', () => {
  test('renders HomeMenu when the user is authenticated', () => {
    render(
      <Router>
        <HomeMenu />
      </Router>
    );

    // Check for a specific element that would only be visible if the page has rendered
    // For example, checking for the presence of the "Start Game" button
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });
});
