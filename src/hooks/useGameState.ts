import { useState, useEffect, useCallback } from 'react';
import PlayFabClient from '../lib/playfabClient';

// Define the shape of our game state
interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  lastSaved?: number;
}

// Initial game state
const initialGameState: GameState = {
  score: 0,
  level: 1,
  isPlaying: false,
};

// Game state keys in PlayFab
const GAME_STATE_KEY = 'GameState';

/**
 * Custom hook for managing game state with PlayFab integration
 * Handles loading, saving, and updating game state
 */
export const useGameState = (autoSave = true) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playfabClient] = useState(() => new PlayFabClient());
  
  // Load game state from PlayFab
  const loadGameState = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await playfabClient.getPlayerData([GAME_STATE_KEY]);
      
      if (result.data[GAME_STATE_KEY]) {
        // Parse the stored game state
        const savedState = JSON.parse(result.data[GAME_STATE_KEY]);
        
        // Merge with initial state to ensure all properties exist
        setGameState({
          ...initialGameState,
          ...savedState,
        });
        
        console.log('Game state loaded from PlayFab');
      } else {
        // No saved state found, use initial state
        setGameState(initialGameState);
        console.log('No saved game state found, using initial state');
      }
    } catch (err) {
      console.error('Failed to load game state:', err);
      setError('Failed to load game state');
      // Continue with initial state on error
      setGameState(initialGameState);
    } finally {
      setIsLoading(false);
    }
  }, [playfabClient]);
  
  // Save game state to PlayFab
  const saveGameState = useCallback(async (state: GameState) => {
    setError(null);
    
    try {
      // Add timestamp to track when the state was last saved
      const stateToSave = {
        ...state,
        lastSaved: Date.now(),
      };
      
      // Convert state to JSON string for storage
      await playfabClient.updatePlayerData({
        [GAME_STATE_KEY]: JSON.stringify(stateToSave),
      });
      
      console.log('Game state saved to PlayFab');
      return true;
    } catch (err) {
      console.error('Failed to save game state:', err);
      setError('Failed to save game state');
      return false;
    }
  }, [playfabClient]);
  
  // Load game state on initial mount
  useEffect(() => {
    loadGameState();
  }, [loadGameState]);
  
  // Game state update functions with PlayFab integration
  const startGame = useCallback(() => {
    const newState = {
      ...initialGameState,
      isPlaying: true,
    };
    
    setGameState(newState);
    
    // Save state to PlayFab if autoSave is enabled
    if (autoSave) {
      saveGameState(newState);
    }
  }, [autoSave, saveGameState]);
  
  const endGame = useCallback(() => {
    const newState = {
      ...gameState,
      isPlaying: false,
    };
    
    setGameState(newState);
    
    // Always save when game ends
    saveGameState(newState);
  }, [gameState, saveGameState]);
  
  const updateScore = useCallback((points: number) => {
    const newState = {
      ...gameState,
      score: gameState.score + points,
    };
    
    setGameState(newState);
    
    // Save state to PlayFab if autoSave is enabled
    if (autoSave) {
      saveGameState(newState);
    }
  }, [autoSave, gameState, saveGameState]);
  
  const levelUp = useCallback(() => {
    const newState = {
      ...gameState,
      level: gameState.level + 1,
    };
    
    setGameState(newState);
    
    // Save state to PlayFab if autoSave is enabled
    if (autoSave) {
      saveGameState(newState);
    }
  }, [autoSave, gameState, saveGameState]);
  
  return {
    gameState,
    isLoading,
    error,
    startGame,
    endGame,
    updateScore,
    levelUp,
    saveGameState: () => saveGameState(gameState),
    loadGameState,
  };
};

export default useGameState;
