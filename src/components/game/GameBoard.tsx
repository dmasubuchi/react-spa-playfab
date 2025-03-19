import React from 'react';
import { useGameContext } from '../../contexts/GameContext';
import GameControls from './GameControls';
import GameStats from './GameStats';

/**
 * Game Board Component
 * Main container for the game interface
 * Displays game stats and controls
 */
const GameBoard: React.FC = () => {
  const { gameState, error } = useGameContext();
  
  return (
    <div className="game-board">
      <h1>PlayFab Game Demo</h1>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      <div className="game-container">
        <div className="game-info">
          <GameStats />
        </div>
        
        <div className="game-interaction">
          <GameControls />
        </div>
      </div>
      
      {gameState.isPlaying && (
        <div className="game-content">
          <div className="game-visualization">
            <h3>Game Visualization</h3>
            <div className="game-visual-container">
              <div 
                className="game-character"
                style={{ 
                  transform: `scale(${1 + (gameState.level * 0.1)})`,
                  backgroundColor: gameState.level > 5 ? '#ffd700' : '#3498db'
                }}
              >
                <span>Level {gameState.level}</span>
              </div>
              
              <div className="game-score-display">
                <span>{gameState.score} pts</span>
              </div>
            </div>
            
            <p className="game-instructions">
              Click "Collect Points" to earn points. Level up to increase your character's size and change its appearance.
              Your progress is automatically saved to PlayFab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
