// Data Integration Service for PlayFab-CosmosDB
// This service handles data synchronization between PlayFab and CosmosDB

import PlayFabClient from '../lib/playfabClient';
import AzureQueueClient from '../lib/azureQueueClient';

/**
 * Data Integration Service class
 * Provides methods for synchronizing data between PlayFab and CosmosDB
 */
export class DataIntegrationService {
  private playfabClient: PlayFabClient;
  private queueClient: AzureQueueClient;
  
  constructor() {
    this.playfabClient = new PlayFabClient();
    this.queueClient = new AzureQueueClient();
  }
  
  /**
   * Synchronize player data to CosmosDB
   * @param playerId Player ID
   * @param data Player data to synchronize
   * @returns True if synchronization was successful, false otherwise
   */
  async syncPlayerData(playerId: string, data: Record<string, unknown>): Promise<boolean> {
    try {
      // First, update data in PlayFab
      // Convert data to string values for PlayFab
      const playfabData: Record<string, string> = {};
      Object.entries(data).forEach(([key, value]) => {
        playfabData[key] = typeof value === 'string' ? value : JSON.stringify(value);
      });
      
      await this.playfabClient.updatePlayerData(playfabData);
      
      // Then, enqueue a message to update data in CosmosDB
      return await this.queueClient.enqueuePlayerDataOperation('update', playerId, data);
    } catch (error) {
      console.error('Failed to synchronize player data:', error);
      return false;
    }
  }
  
  /**
   * Delete player data from CosmosDB
   * @param playerId Player ID
   * @returns True if deletion was successful, false otherwise
   */
  async deletePlayerData(playerId: string): Promise<boolean> {
    try {
      // First, delete data from PlayFab
      // Note: This is a placeholder as PlayFab doesn't have a direct method to delete all player data
      
      // Then, enqueue a message to delete data from CosmosDB
      return await this.queueClient.enqueuePlayerDataOperation('delete', playerId);
    } catch (error) {
      console.error('Failed to delete player data:', error);
      return false;
    }
  }
  
  /**
   * Execute a CloudScript function
   * @param functionName Name of the CloudScript function to execute
   * @param parameters Parameters to pass to the function
   * @returns Result of the CloudScript execution
   */
  async executeCloudScript(functionName: string, parameters: Record<string, unknown> = {}): Promise<unknown> {
    try {
      const result = await this.playfabClient.executeCloudScript(functionName, parameters);
      return result.functionResult;
    } catch (error) {
      console.error(`Failed to execute CloudScript function ${functionName}:`, error);
      throw error;
    }
  }
}

export default DataIntegrationService;
