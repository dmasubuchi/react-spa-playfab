import React from 'react';
import { useGameContext } from '../../contexts/GameContext';

/**
 * Game Controls Component
 * Provides UI controls for starting, ending, and interacting with the game
 */
const GameControls: React.FC = () => {
  const { 
    gameState, 
    isLoading, 
    startGame, 
    endGame, 
    updateScore, 
    levelUp,
    saveGameState
  } = useGameContext();

  const handleAddPoints = () => {
    // Add 10 points to the score
    updateScore(10);
  };

  return (
    <div className="game-controls">
      <h2>Game Controls</h2>
      
      {isLoading ? (
        <p>Loading game state...</p>
      ) : (
        <div className="controls-container">
          {!gameState.isPlaying ? (
            <button 
              className="start-button"
              onClick={startGame}
            >
              Start Game
            </button>
          ) : (
            <>
              <div className="game-actions">
                <button 
                  className="action-button"
                  onClick={handleAddPoints}
                >
                  Collect Points (+10)
                </button>
                
                <button 
                  className="action-button"
                  onClick={levelUp}
                >
                  Level Up
                </button>
                
                <button 
                  className="action-button"
                  onClick={() => saveGameState()}
                >
                  Save Progress
                </button>
              </div>
              
              <button 
                className="end-button"
                onClick={endGame}
              >
                End Game
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GameControls;
