import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our game state
interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
}

// Define the shape of our context
interface GameContextType {
  gameState: GameState;
  startGame: () => void;
  endGame: () => void;
  updateScore: (points: number) => void;
  levelUp: () => void;
}

// Create the context with a default value
const GameContext = createContext<GameContextType | undefined>(undefined);

// Initial game state
const initialGameState: GameState = {
  score: 0,
  level: 1,
  isPlaying: false,
};

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <GameContext.Provider
      value={{
        gameState,
        startGame,
        endGame,
        updateScore,
        levelUp,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
