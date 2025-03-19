import { useState } from 'react';

// Define the shape of our game state
interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
}

// Initial game state
const initialGameState: GameState = {
  score: 0,
  level: 1,
  isPlaying: false,
};

// This is a placeholder for the game state hook
// Will be implemented in Phase 4
export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const startGame = () => {
    setGameState({
      ...initialGameState,
      isPlaying: true,
    });
  };

  const endGame = () => {
    setGameState({
      ...gameState,
      isPlaying: false,
    });
  };

  const updateScore = (points: number) => {
    setGameState({
      ...gameState,
      score: gameState.score + points,
    });
  };

  const levelUp = () => {
    setGameState({
      ...gameState,
      level: gameState.level + 1,
    });
  };

  return {
    gameState,
    startGame,
    endGame,
    updateScore,
    levelUp,
  };
};

export default useGameState;
