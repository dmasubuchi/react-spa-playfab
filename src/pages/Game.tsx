import React from 'react';

const Game: React.FC = () => {
  return (
    <div className="game-page">
      <h1>Game</h1>
      <p>This is where the game will be implemented in Phase 4.</p>
      <div className="game-container">
        <div className="game-stats">
          <p>Score: 0</p>
          <p>Level: 1</p>
        </div>
        <div className="game-area">
          <p>Game content will appear here</p>
        </div>
        <div className="game-controls">
          <button className="control-button">Start</button>
          <button className="control-button">Pause</button>
        </div>
      </div>
    </div>
  );
};

export default Game;
