// Register Azure Functions with PlayFab as CloudScript
import fs from 'fs';
import https from 'node:https';
import { exit } from 'node:process';

// PlayFab API credentials
const titleId = process.env.PLAYFAB_TITLE_ID || '6D140';
const developerSecretKey = process.env.PLAYFAB_SECRET_KEY;

if (!developerSecretKey) {
  console.error('Error: PLAYFAB_SECRET_KEY environment variable is required');
  exit(1);
}

// Azure Function App details
const functionAppName = process.env.FUNCTION_APP_NAME || 'reactspaplayfabfunctions';
const azureRegion = process.env.AZURE_REGION || 'eastasia';
const functionName = 'dataSync';

// PlayFab API endpoint
const playfabApiUrl = `https://${titleId}.playfabapi.com/Admin/SetupAzureFunction`;

// Function registration payload
const payload = {
  FunctionName: functionName,
  Title: titleId,
  AzureResourceId: `/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/resourceGroups/tohoku-univ-osampo-rg/providers/Microsoft.Web/sites/${functionAppName}`,
  SecretKey: developerSecretKey,
  ConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING
};

// Make the API request
const requestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SecretKey': developerSecretKey
  }
};

const req = https.request(playfabApiUrl, requestOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (response.code === 200) {
      console.log('Azure Function successfully registered with PlayFab CloudScript');
      console.log(response.data);
    } else {
      console.error('Error registering Azure Function with PlayFab CloudScript');
      console.error(response);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making API request:', error);
});

req.write(JSON.stringify(payload));
req.end();
