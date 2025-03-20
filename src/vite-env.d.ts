/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_PLAYFAB_TITLE_ID: string;
    readonly VITE_PLAYFAB_SECRET_KEY: string;
    readonly VITE_AZURE_STORAGE_ACCOUNT: string;
    readonly VITE_AZURE_STORAGE_KEY: string;
    readonly VITE_AZURE_STORAGE_CONTAINER: string;
    readonly VITE_AZURE_STORAGE_SAS_TOKEN: string;
    readonly VITE_AZURE_CDN_ENDPOINT: string;
    readonly VITE_AZURE_COSMOSDB_CONNECTION_STRING: string;
    readonly VITE_AZURE_FUNCTIONS_ENDPOINT: string;
    readonly VITE_AZURE_KEYVAULT_NAME: string;
    readonly VITE_AZURE_KEYVAULT_URI: string;
    readonly [key: string]: string | boolean | undefined;
  };
}
