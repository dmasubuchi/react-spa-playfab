const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function(context, myQueueItem) {
  context.log('Queue trigger function processed work item:', myQueueItem);
  
  try {
    // Get secrets from KeyVault
    const keyVaultName = process.env.AZURE_KEYVAULT_NAME;
    const keyVaultUri = `https://${keyVaultName}.vault.azure.net/`;
    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(keyVaultUri, credential);
    
    // Get CosmosDB connection string
    const cosmosConnectionString = await secretClient.getSecret('CosmosDBConnectionString');
    
    // Initialize CosmosDB client
    const cosmosClient = new CosmosClient(cosmosConnectionString.value);
    const database = cosmosClient.database('gamedata');
    const container = database.container('players');
    
    // Process the queue message
    const { operation, playerId, data } = myQueueItem;
    
    switch (operation) {
      case 'create':
      case 'update':
        // Create or update item in CosmosDB
        await container.items.upsert({
          id: playerId,
          ...data,
          _lastUpdated: new Date().toISOString()
        });
        context.log(`Player data ${operation}d for player ${playerId}`);
        break;
        
      case 'read':
        // Read item from CosmosDB
        const { resource } = await container.item(playerId, playerId).read();
        context.log(`Player data read for player ${playerId}`);
        break;
        
      case 'delete':
        // Delete item from CosmosDB
        await container.item(playerId, playerId).delete();
        context.log(`Player data deleted for player ${playerId}`);
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    context.log('Queue trigger function completed successfully');
  } catch (error) {
    context.log.error('Error in queue trigger function:', error);
    throw error;
  }
};
