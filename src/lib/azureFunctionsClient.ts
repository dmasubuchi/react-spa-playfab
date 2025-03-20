// Azure Functions client for special processing
// This utility helps interact with Azure Functions

/**
 * Azure Functions configuration interface
 */
interface AzureFunctionsConfig {
  endpoint: string;
}

// Get endpoint from environment variables
const endpoint = typeof import.meta.env !== 'undefined' 
  ? import.meta.env.VITE_AZURE_FUNCTIONS_ENDPOINT 
  : 'https://reactspaplayfabfunctions.azurewebsites.net';

// Default configuration
const defaultConfig: AzureFunctionsConfig = {
  endpoint,
};

/**
 * Azure Functions client class for handling special processing
 * Provides methods for calling Azure Functions
 */
export class AzureFunctionsClient {
  public config: AzureFunctionsConfig;
  
  constructor(config: Partial<AzureFunctionsConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
  }
  
  /**
   * Call an Azure Function
   * @param functionName Name of the function to call
   * @param data Data to send to the function
   * @returns Response from the function
   */
  async callFunction<T = unknown, R = unknown>(functionName: string, data?: T): Promise<R> {
    try {
      console.log(`Calling Azure Function: ${functionName}`);
      
      const response = await fetch(`${this.config.endpoint}/api/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`Function call failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      return result as R;
    } catch (error) {
      console.error(`Failed to call Azure Function ${functionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Validate custom game data using Azure Function
   * @param gameData Game data to validate
   * @returns Validation result
   */
  async validateGameData<T = unknown>(gameData: T): Promise<{ isValid: boolean; errors?: string[] }> {
    try {
      return await this.callFunction<T, { isValid: boolean; errors?: string[] }>('validateGameData', gameData);
    } catch (error) {
      console.error('Game data validation failed:', error);
      return { isValid: false, errors: ['Validation service unavailable'] };
    }
  }
  
  /**
   * Process leaderboard data using Azure Function
   * @param playerId Player ID
   * @param score Player score
   * @returns Updated leaderboard position
   */
  async processLeaderboard(playerId: string, score: number): Promise<{ position: number; topScores: Array<{ playerId: string; score: number; position: number }> }> {
    try {
      return await this.callFunction<{ playerId: string; score: number }, { position: number; topScores: Array<{ playerId: string; score: number; position: number }> }>('leaderboardExtras', { playerId, score });
    } catch (error) {
      console.error('Leaderboard processing failed:', error);
      throw error;
    }
  }
}

export default AzureFunctionsClient;
