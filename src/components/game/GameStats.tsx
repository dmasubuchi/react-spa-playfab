import React from 'react';
import { useGameContext } from '../../contexts/GameContext';

/**
 * Game Stats Component
 * Displays the current game statistics (score, level, etc.)
 */
const GameStats: React.FC = () => {
  const { gameState, isLoading } = useGameContext();
  
  if (isLoading) {
    return <div className="game-stats loading">Loading game stats...</div>;
  }
  
  return (
    <div className="game-stats">
      <h2>Game Statistics</h2>
      
      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{gameState.score}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{gameState.level}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span className="stat-value status">
            {gameState.isPlaying ? (
              <span className="status-active">Active</span>
            ) : (
              <span className="status-inactive">Inactive</span>
            )}
          </span>
        </div>
        
        {gameState.lastSaved && (
          <div className="stat-item">
            <span className="stat-label">Last Saved:</span>
            <span className="stat-value">
              {new Date(gameState.lastSaved).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;
