// Azure Queue Storage client for PlayFab-CosmosDB integration
// This utility helps enqueue messages for processing by Azure Functions

import AzureKeyVaultClient from './azureKeyVaultClient';

// Define Azure Queue Storage configuration interface
interface AzureQueueConfig {
  storageAccount: string;
  storageKey?: string;
  queueName: string;
}

// Default configuration from environment variables
const defaultConfig: AzureQueueConfig = {
  storageAccount: import.meta.env.VITE_AZURE_STORAGE_ACCOUNT as string,
  queueName: 'playfab-cosmos-queue',
};

/**
 * Azure Queue Storage client class for handling queue operations
 * Provides methods for enqueueing messages for Azure Functions
 */
export class AzureQueueClient {
  public config: AzureQueueConfig;
  private keyVaultClient: AzureKeyVaultClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queueServiceClient: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queueClient: any = null;

  constructor(config: Partial<AzureQueueConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    
    this.keyVaultClient = new AzureKeyVaultClient();
    this.initializeClient();
  }

  /**
   * Initialize the Azure Queue Storage client
   * Uses storage key from KeyVault if available
   */
  private async initializeClient(): Promise<void> {
    try {
      // Import required Azure Storage Queue SDK
      // Note: This requires @azure/storage-queue package to be installed
      const { QueueServiceClient } = await import('@azure/storage-queue');
      
      let storageKey = this.config.storageKey;
      
      // Check if the storage key is a KeyVault reference
      if (!storageKey) {
        const envStorageKey = import.meta.env.VITE_AZURE_STORAGE_KEY as string;
        if (envStorageKey && envStorageKey.startsWith('@Microsoft.KeyVault')) {
          const secretName = AzureKeyVaultClient.parseKeyVaultReference(envStorageKey);
          if (secretName) {
            storageKey = await this.keyVaultClient.getSecret(secretName) || undefined;
          }
        }
      }
      
      if (!storageKey) {
        console.warn('Azure Queue Storage client not properly initialized. Missing storage key.');
        return;
      }
      
      // Initialize with storage account and key
      const connectionString = `DefaultEndpointsProtocol=https;AccountName=${this.config.storageAccount};AccountKey=${storageKey};EndpointSuffix=core.windows.net`;
      this.queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
      this.queueClient = this.queueServiceClient.getQueueClient(this.config.queueName);
      
      // Create the queue if it doesn't exist
      await this.queueClient.createIfNotExists();
      
      console.log(`Azure Queue Storage client initialized for queue: ${this.config.queueName}`);
    } catch (error) {
      console.error('Failed to initialize Azure Queue Storage client:', error);
    }
  }

  /**
   * Enqueue a message to Azure Queue Storage
   * @param message Message to enqueue
   * @returns True if message was enqueued successfully, false otherwise
   */
  async enqueueMessage(message: Record<string, unknown>): Promise<boolean> {
    if (!this.queueClient) {
      console.warn('Azure Queue Storage client not properly initialized. Cannot enqueue message.');
      return false;
    }
    
    try {
      console.log('Enqueueing message to Azure Queue Storage:', message);
      
      // Convert message to base64-encoded string
      const messageText = Buffer.from(JSON.stringify(message)).toString('base64');
      
      // Enqueue the message
      await this.queueClient.sendMessage(messageText);
      
      console.log('Message enqueued successfully');
      return true;
    } catch (error) {
      console.error('Failed to enqueue message:', error);
      return false;
    }
  }

  /**
   * Enqueue a player data operation to Azure Queue Storage
   * @param operation Operation type (create, read, update, delete)
   * @param playerId Player ID
   * @param data Player data
   * @returns True if message was enqueued successfully, false otherwise
   */
  async enqueuePlayerDataOperation(
    operation: 'create' | 'read' | 'update' | 'delete',
    playerId: string,
    data?: Record<string, unknown>
  ): Promise<boolean> {
    return this.enqueueMessage({
      operation,
      playerId,
      data: data || {},
      timestamp: new Date().toISOString(),
    });
  }
}

export default AzureQueueClient;
