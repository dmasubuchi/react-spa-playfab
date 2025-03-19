// Azure Blob Storage client for image uploads
// Implemented in Phase 3

// Import required Azure Storage SDK
// Note: This requires @azure/storage-blob package to be installed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters } = require('@azure/storage-blob');

// Define Azure Storage configuration interface
interface AzureStorageConfig {
  accountName: string;
  accountKey?: string;
  containerName: string;
  sasToken?: string;
  cdnEndpoint?: string;
}

// Default configuration from environment variables
const defaultConfig: AzureStorageConfig = {
  accountName: (import.meta.env?.VITE_AZURE_STORAGE_ACCOUNT as string) || 'YOUR_STORAGE_ACCOUNT_NAME',
  accountKey: (import.meta.env?.VITE_AZURE_STORAGE_KEY as string) || undefined,
  containerName: (import.meta.env?.VITE_AZURE_STORAGE_CONTAINER as string) || 'profile-images',
  cdnEndpoint: (import.meta.env?.VITE_AZURE_CDN_ENDPOINT as string) || undefined,
};

/**
 * Azure Storage client class for handling blob operations
 * Provides methods for uploading, retrieving, and deleting images
 */
export class AzureStorageClient {
  public config: AzureStorageConfig;
  private blobServiceClient: typeof BlobServiceClient | null = null;
  private containerClient: { getBlockBlobClient: (blobName: string) => { upload: (data: ArrayBuffer, length: number, options?: Record<string, unknown>) => Promise<unknown>; delete: () => Promise<unknown> } } | null = null;
  
  constructor(config: Partial<AzureStorageConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    
    this.initializeClient();
  }
  
  /**
   * Initialize the Azure Blob Service client
   * Uses account key if available, otherwise falls back to SAS token
   */
  private initializeClient(): void {
    try {
      // If we have an account key, use SharedKeyCredential
      if (this.config.accountKey) {
        const sharedKeyCredential = new StorageSharedKeyCredential(
          this.config.accountName,
          this.config.accountKey
        );
        
        this.blobServiceClient = new BlobServiceClient(
          `https://${this.config.accountName}.blob.core.windows.net`,
          sharedKeyCredential
        );
      } 
      // If we have a SAS token, use that
      else if (this.config.sasToken) {
        this.blobServiceClient = new BlobServiceClient(
          `https://${this.config.accountName}.blob.core.windows.net${this.config.sasToken}`
        );
      }
      // Otherwise, we'll operate in a limited mode (URL generation only)
      else {
        console.warn('No Azure Storage credentials provided. Operating in limited mode.');
      }
      
      // Get container client if blob service client is available
      if (this.blobServiceClient) {
        this.containerClient = this.blobServiceClient.getContainerClient(this.config.containerName);
        console.log(`Azure Storage client initialized for container: ${this.config.containerName}`);
      }
    } catch (error) {
      console.error('Failed to initialize Azure Storage client:', error);
    }
  }
  
  /**
   * Generate a URL for a blob
   * Uses CDN endpoint if configured, otherwise direct blob storage URL
   */
  getBlobUrl(blobName: string): string {
    // Use CDN endpoint if available
    if (this.config.cdnEndpoint) {
      return `${this.config.cdnEndpoint}/${blobName}`;
    }
    
    // Otherwise use direct blob storage URL
    return `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${blobName}`;
  }
  
  /**
   * Generate a SAS URL with temporary access to a blob
   * Useful for providing time-limited access to private blobs
   */
  async generateSasUrl(blobName: string, expiryMinutes = 60): Promise<string> {
    if (!this.config.accountKey) {
      console.warn('Cannot generate SAS URL without account key');
      return this.getBlobUrl(blobName);
    }
    
    try {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        this.config.accountName,
        this.config.accountKey
      );
      
      // Set expiry time
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
      
      // Define permissions
      const sasOptions = {
        containerName: this.config.containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse('r'), // Read-only permission
        expiresOn: expiryTime,
      };
      
      // Generate SAS token
      const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
      ).toString();
      
      // Return full URL with SAS token
      return `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${blobName}?${sasToken}`;
    } catch (error) {
      console.error('Failed to generate SAS URL:', error);
      return this.getBlobUrl(blobName);
    }
  }
  
  /**
   * Upload an image file to Azure Blob Storage
   * Returns the URL of the uploaded blob
   */
  async uploadImage(file: File): Promise<string> {
    if (!this.containerClient) {
      console.warn('Azure Storage client not properly initialized. Cannot upload image.');
      throw new Error('Storage client not initialized');
    }
    
    try {
      console.log(`Uploading file: ${file.name}`);
      
      // Generate a unique blob name to avoid collisions
      const blobName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer();
      
      // Upload the file
      await blockBlobClient.upload(arrayBuffer, arrayBuffer.byteLength, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });
      
      console.log(`File uploaded successfully: ${blobName}`);
      return this.getBlobUrl(blobName);
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error('Failed to upload image');
    }
  }
  
  /**
   * Delete a blob from Azure Blob Storage
   * Returns true if successful, false otherwise
   */
  async deleteBlob(blobUrl: string): Promise<boolean> {
    if (!this.containerClient) {
      console.warn('Azure Storage client not properly initialized. Cannot delete blob.');
      return false;
    }
    
    try {
      // Extract blob name from URL
      const blobName = this.getBlobNameFromUrl(blobUrl);
      if (!blobName) {
        console.error('Invalid blob URL:', blobUrl);
        return false;
      }
      
      console.log(`Deleting blob: ${blobName}`);
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      // Delete the blob
      await blockBlobClient.delete();
      console.log(`Blob deleted successfully: ${blobName}`);
      return true;
    } catch (error) {
      console.error('Failed to delete blob:', error);
      return false;
    }
  }
  
  /**
   * Extract blob name from a blob URL
   * Helper method for deleteBlob
   */
  private getBlobNameFromUrl(blobUrl: string): string | null {
    try {
      // Handle CDN URLs
      if (this.config.cdnEndpoint && blobUrl.startsWith(this.config.cdnEndpoint)) {
        return blobUrl.substring(this.config.cdnEndpoint.length + 1);
      }
      
      // Handle direct blob storage URLs
      const urlPattern = new RegExp(
        `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/(.+?)(?:\\?|$)`
      );
      const match = blobUrl.match(urlPattern);
      
      if (match && match[1]) {
        return match[1];
      }
      
      return null;
    } catch (error) {
      console.error('Failed to extract blob name from URL:', error);
      return null;
    }
  }
}

export default AzureStorageClient;
