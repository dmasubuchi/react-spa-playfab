// Azure CosmosDB SQL API client for game data storage
// This utility helps interact with Azure CosmosDB SQL API

// Import required Azure CosmosDB SDK
// Note: This requires @azure/cosmos package to be installed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CosmosClient } = require('@azure/cosmos');
import AzureKeyVaultClient from './azureKeyVaultClient';

// Define Azure CosmosDB configuration interface
interface AzureCosmosDbConfig {
  connectionString?: string;
  endpoint?: string;
  key?: string;
  databaseId: string;
  containerId: string;
}

// Default configuration from environment variables
const defaultConfig: AzureCosmosDbConfig = {
  connectionString: import.meta.env.VITE_AZURE_COSMOSDB_CONNECTION_STRING,
  databaseId: 'gamedata',
  containerId: 'players',
};

/**
 * Azure CosmosDB client class for handling database operations
 * Provides methods for CRUD operations on game data
 */
export class AzureCosmosDbClient {
  public config: AzureCosmosDbConfig;
  private cosmosClient: typeof CosmosClient | null = null;
  private database: { container: (containerId: string) => any } | null = null;
  private container: any | null = null;
  private keyVaultClient: AzureKeyVaultClient | null = null;
  
  constructor(config: Partial<AzureCosmosDbConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    
    this.keyVaultClient = new AzureKeyVaultClient();
    this.initializeClient();
  }
  
  /**
   * Initialize the Azure CosmosDB client
   * Uses connection string from KeyVault if available
   */
  private async initializeClient(): Promise<void> {
    try {
      let connectionString = this.config.connectionString;
      
      // Check if the connection string is a KeyVault reference
      if (connectionString && connectionString.startsWith('@Microsoft.KeyVault')) {
        const secretName = AzureKeyVaultClient.parseKeyVaultReference(connectionString);
        if (secretName && this.keyVaultClient) {
          const secret = await this.keyVaultClient.getSecret(secretName);
          if (secret) {
            connectionString = secret;
          }
        }
      }
      
      if (!connectionString && (!this.config.endpoint || !this.config.key)) {
        console.warn('Azure CosmosDB client not properly initialized. Missing connection information.');
        return;
      }
      
      // Initialize with connection string if available
      if (connectionString) {
        this.cosmosClient = new CosmosClient(connectionString);
      } 
      // Otherwise use endpoint and key
      else if (this.config.endpoint && this.config.key) {
        this.cosmosClient = new CosmosClient({
          endpoint: this.config.endpoint,
          key: this.config.key,
        });
      }
      
      if (this.cosmosClient) {
        this.database = this.cosmosClient.database(this.config.databaseId);
        if (this.database) {
          this.container = this.database.container(this.config.containerId);
          console.log(`Azure CosmosDB client initialized for database: ${this.config.databaseId}, container: ${this.config.containerId}`);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Azure CosmosDB client:', error);
    }
  }
  
  /**
   * Create or replace an item in the container
   * @param id Unique identifier for the item
   * @param item Item data to store
   * @returns The created or replaced item
   */
  async upsertItem(id: string, item: Record<string, any>): Promise<Record<string, any> | null> {
    if (!this.container) {
      console.warn('Azure CosmosDB client not properly initialized. Cannot upsert item.');
      return null;
    }
    
    try {
      console.log(`Upserting item with id: ${id}`);
      
      // Ensure the item has an id property
      const itemWithId = {
        ...item,
        id,
      };
      
      const { resource } = await this.container.items.upsert(itemWithId);
      console.log(`Item upserted successfully: ${id}`);
      return resource;
    } catch (error) {
      console.error(`Failed to upsert item ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Read an item from the container
   * @param id Unique identifier for the item
   * @returns The requested item or null if not found
   */
  async readItem(id: string): Promise<Record<string, any> | null> {
    if (!this.container) {
      console.warn('Azure CosmosDB client not properly initialized. Cannot read item.');
      return null;
    }
    
    try {
      console.log(`Reading item with id: ${id}`);
      const { resource } = await this.container.item(id, id).read();
      return resource;
    } catch (error) {
      // If item not found, return null instead of throwing
      if ((error as any).code === 404) {
        console.log(`Item not found: ${id}`);
        return null;
      }
      
      console.error(`Failed to read item ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Delete an item from the container
   * @param id Unique identifier for the item
   * @returns True if deletion was successful, false otherwise
   */
  async deleteItem(id: string): Promise<boolean> {
    if (!this.container) {
      console.warn('Azure CosmosDB client not properly initialized. Cannot delete item.');
      return false;
    }
    
    try {
      console.log(`Deleting item with id: ${id}`);
      await this.container.item(id, id).delete();
      console.log(`Item deleted successfully: ${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete item ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Query items in the container
   * @param query SQL query string
   * @param parameters Query parameters
   * @returns Array of items matching the query
   */
  async queryItems(query: string, parameters: any[] = []): Promise<Record<string, any>[]> {
    if (!this.container) {
      console.warn('Azure CosmosDB client not properly initialized. Cannot query items.');
      return [];
    }
    
    try {
      console.log(`Querying items with query: ${query}`);
      const { resources } = await this.container.items.query({
        query,
        parameters,
      }).fetchAll();
      
      return resources;
    } catch (error) {
      console.error('Failed to query items:', error);
      return [];
    }
  }
}

export default AzureCosmosDbClient;
