# Azure Functions for PlayFab-CosmosDB Integration

This directory contains Azure Functions that handle data synchronization between PlayFab and CosmosDB.

## Setup

1. Install dependencies:
   ```
   cd api-functions/dataSync
   npm install
   ```

2. Configure local settings:
   - Create a `local.settings.json` file with the following content:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "AZURE_KEYVAULT_NAME": "reactspaplayfabkv"
     }
   }
   ```

3. Run locally:
   ```
   func start
   ```

## Deployment

1. Deploy to Azure:
   ```
   cd ../../
   ./scripts/deploy-functions.sh
   ```

2. Register with PlayFab:
   ```
   export PLAYFAB_SECRET_KEY=your_secret_key
   export AZURE_SUBSCRIPTION_ID=your_subscription_id
   export AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
   node scripts/register-playfab-cloudscript.js
   ```

## Usage

The functions are triggered by messages in the Azure Storage Queue. To send a message to the queue, use the `AzureQueueClient` from the main application.

Example:
```typescript
import AzureQueueClient from '../lib/azureQueueClient';

const queueClient = new AzureQueueClient();
await queueClient.enqueuePlayerDataOperation('update', 'player123', { score: 100 });
```

## Integration with PlayFab

This implementation uses Queue triggers instead of HTTP triggers for better security and reliability. The data flow is as follows:

1. Client application updates data in PlayFab using standard PlayFab API
2. Client application enqueues a message to Azure Queue Storage
3. Azure Function is triggered by the queue message
4. Azure Function processes the data and updates CosmosDB
5. Extended game data is stored in CosmosDB while basic player data remains in PlayFab

This approach minimizes the use of PlayFab CloudScript while still enabling complex data operations when needed.
