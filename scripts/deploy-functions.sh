#!/bin/bash
# Deploy Azure Functions to Azure

# Set variables
RESOURCE_GROUP="tohoku-univ-osampo-rg"
FUNCTION_APP_NAME="reactspaplayfabfunctions"
STORAGE_ACCOUNT="reactspaplayfabstorage"
LOCATION="eastasia"
FUNCTIONS_DIR="api-functions/dataSync"

# Login to Azure (if not already logged in)
az account show > /dev/null || az login

# Create Function App if it doesn't exist
az functionapp show --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Creating Function App $FUNCTION_APP_NAME..."
  az functionapp create --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --storage-account $STORAGE_ACCOUNT \
    --consumption-plan-location $LOCATION \
    --runtime node \
    --runtime-version 18 \
    --functions-version 4
else
  echo "Function App $FUNCTION_APP_NAME already exists."
fi

# Set Function App settings
echo "Configuring Function App settings..."
az functionapp config appsettings set --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings "AZURE_KEYVAULT_NAME=reactspaplayfabkv"

# Deploy the function
echo "Deploying functions to $FUNCTION_APP_NAME..."
cd $FUNCTIONS_DIR
npx func azure functionapp publish $FUNCTION_APP_NAME --javascript

echo "Deployment completed."
