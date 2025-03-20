// Azure KeyVault client for secure credential access
// This utility helps retrieve secrets from Azure KeyVault

// Import required Azure KeyVault SDK
// Note: This requires @azure/keyvault-secrets package to be installed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SecretClient } = require('@azure/keyvault-secrets');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DefaultAzureCredential } = require('@azure/identity');

// Define Azure KeyVault configuration interface
interface AzureKeyVaultConfig {
  vaultName: string;
  vaultUri?: string;
}

// Default configuration from environment variables
const defaultConfig: AzureKeyVaultConfig = {
  vaultName: (import.meta.env?.VITE_AZURE_KEYVAULT_NAME as string) || 'reactspaplayfabkv',
  vaultUri: (import.meta.env?.VITE_AZURE_KEYVAULT_URI as string) || 'https://reactspaplayfabkv.vault.azure.net/',
};

/**
 * Azure KeyVault client class for handling secret operations
 * Provides methods for retrieving secrets from KeyVault
 */
export class AzureKeyVaultClient {
  public config: AzureKeyVaultConfig;
  private secretClient: typeof SecretClient | null = null;
  private secretCache: Map<string, { value: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 3600000; // 1 hour cache TTL
  
  constructor(config: Partial<AzureKeyVaultConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    
    this.initializeClient();
  }
  
  /**
   * Initialize the Azure KeyVault Secret client
   * Uses DefaultAzureCredential for authentication
   */
  private initializeClient(): void {
    try {
      const credential = new DefaultAzureCredential();
      
      this.secretClient = new SecretClient(
        this.config.vaultUri || `https://${this.config.vaultName}.vault.azure.net/`,
        credential
      );
      
      console.log(`Azure KeyVault client initialized for vault: ${this.config.vaultName}`);
    } catch (error) {
      console.error('Failed to initialize Azure KeyVault client:', error);
    }
  }
  
  /**
   * Get a secret from Azure KeyVault
   * Uses cache if available and not expired
   */
  async getSecret(secretName: string): Promise<string | null> {
    // Check cache first
    const cachedSecret = this.secretCache.get(secretName);
    if (cachedSecret && Date.now() - cachedSecret.timestamp < this.CACHE_TTL_MS) {
      console.log(`Using cached secret: ${secretName}`);
      return cachedSecret.value;
    }
    
    if (!this.secretClient) {
      console.warn('Azure KeyVault client not properly initialized. Cannot get secret.');
      return null;
    }
    
    try {
      console.log(`Retrieving secret: ${secretName}`);
      const secret = await this.secretClient.getSecret(secretName);
      
      if (secret && secret.value) {
        // Update cache
        this.secretCache.set(secretName, {
          value: secret.value,
          timestamp: Date.now(),
        });
        
        return secret.value;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      return null;
    }
  }
  
  /**
   * Clear the secret cache
   * Useful when secrets might have been updated in KeyVault
   */
  clearCache(): void {
    this.secretCache.clear();
    console.log('Secret cache cleared');
  }
  
  /**
   * Parse a KeyVault reference from an environment variable
   * Extracts the secret name from a KeyVault reference string
   */
  static parseKeyVaultReference(reference: string): string | null {
    try {
      // Match pattern: @Microsoft.KeyVault(SecretUri=https://vaultname.vault.azure.net/secrets/secretName/version)
      const match = reference.match(/@Microsoft\.KeyVault\(SecretUri=https:\/\/.*\.vault\.azure\.net\/secrets\/([^/]+)/);
      
      if (match && match[1]) {
        return match[1];
      }
      
      return null;
    } catch (error) {
      console.error('Failed to parse KeyVault reference:', error);
      return null;
    }
  }
}

export default AzureKeyVaultClient;
