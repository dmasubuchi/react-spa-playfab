import React, { createContext, useContext, ReactNode } from 'react';
import useGameState from '../hooks/useGameState';

// Define the shape of our game state
interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  lastSaved?: number;
}

// Define the shape of our context
interface GameContextType {
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
  startGame: () => void;
  endGame: () => void;
  updateScore: (points: number) => void;
  levelUp: () => void;
  saveGameState: () => Promise<boolean>;
  loadGameState: () => Promise<void>;
}

// Create the context with a default value
const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Game Provider Component
 * Provides game state and methods to all child components
 * Uses the useGameState hook for PlayFab integration
 */
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the enhanced useGameState hook with PlayFab integration
  const {
    gameState,
    isLoading,
    error,
    startGame,
    endGame,
    updateScore,
    levelUp,
    saveGameState,
    loadGameState
  } = useGameState(true); // Enable auto-save by default
  
  return (
    <GameContext.Provider
      value={{
        gameState,
        isLoading,
        error,
        startGame,
        endGame,
        updateScore,
        levelUp,
        saveGameState,
        loadGameState
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

/**
 * Custom hook to use the game context
 * Provides access to game state and methods
 */
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
