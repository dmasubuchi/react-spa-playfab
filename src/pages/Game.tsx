import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import GameBoard from '../components/game/GameBoard';

const Game: React.FC = () => {
  const { authState } = useAuth();
  
  return (
    <div className="game-page">
      {authState.isAuthenticated ? (
        <GameBoard />
      ) : (
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in or register to play the game.</p>
          <p>Your game progress will be saved to your PlayFab account.</p>
        </div>
      )}
    </div>
  );
};

export default Game;
