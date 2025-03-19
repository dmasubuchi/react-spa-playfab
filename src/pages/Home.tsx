import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Welcome to React SPA PlayFab</h1>
      <p>This is the home page of the application.</p>
      <div className="action-buttons">
        <button className="primary-button">Play Game</button>
        <button className="secondary-button">View Profile</button>
      </div>
    </div>
  );
};

export default Home;
