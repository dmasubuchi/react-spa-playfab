// Import PlayFab SDK
const PlayFab = require('playfab-sdk');

// Define PlayFab configuration interface
interface PlayFabConfig {
  titleId: string;
  developerSecretKey?: string;
}

// Default configuration
const defaultConfig: PlayFabConfig = {
  titleId: process.env.VITE_PLAYFAB_TITLE_ID || 'YOUR_PLAYFAB_TITLE_ID',
};

// PlayFab client class - thin wrapper around PlayFab SDK
export class PlayFabClient {
  private config: PlayFabConfig;
  private sessionTicket: string | null = null;
  
  constructor(config: Partial<PlayFabConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    
    // Initialize PlayFab SDK with title ID
    PlayFab.settings.titleId = this.config.titleId;
    console.log(`PlayFab client initialized with titleId: ${this.config.titleId}`);
  }
  
  // Method to set session ticket after login
  setSessionTicket(ticket: string): void {
    this.sessionTicket = ticket;
    console.log(`Session ticket set: ${ticket.substring(0, 5)}...`);
  }
  
  // Method to clear session ticket on logout
  clearSessionTicket(): void {
    this.sessionTicket = null;
    console.log('Session ticket cleared');
  }
  
  // Login with email and password
  async loginWithEmailAddress(email: string, password: string): Promise<any> {
    console.log(`Logging in with email: ${email}`);
    
    return new Promise((resolve, reject) => {
      const loginRequest = {
        Email: email,
        Password: password,
        InfoRequestParameters: {
          GetPlayerProfile: true
        }
      };
      
      PlayFab.PlayFabClient.LoginWithEmailAddress(
        loginRequest,
        (result: any) => {
          if (result.data) {
            this.setSessionTicket(result.data.SessionTicket);
            resolve({
              sessionTicket: result.data.SessionTicket,
              playFabId: result.data.PlayFabId,
              displayName: result.data.InfoResultPayload?.PlayerProfile?.DisplayName || '',
            });
          } else {
            reject(new Error('Login failed: No data returned'));
          }
        },
        (error: any) => {
          console.error('Login failed:', error);
          reject(error);
        }
      );
    });
  }
  
  // Register a new PlayFab user
  async registerPlayFabUser(email: string, password: string, displayName: string): Promise<any> {
    console.log(`Registering user with email: ${email}, displayName: ${displayName}`);
    
    return new Promise((resolve, reject) => {
      const registerRequest = {
        Email: email,
        Password: password,
        Username: displayName,
        DisplayName: displayName,
        RequireBothUsernameAndEmail: false
      };
      
      PlayFab.PlayFabClient.RegisterPlayFabUser(
        registerRequest,
        (result: any) => {
          if (result.data) {
            this.setSessionTicket(result.data.SessionTicket);
            resolve({
              sessionTicket: result.data.SessionTicket,
              playFabId: result.data.PlayFabId,
            });
          } else {
            reject(new Error('Registration failed: No data returned'));
          }
        },
        (error: any) => {
          console.error('Registration failed:', error);
          reject(error);
        }
      );
    });
  }
  
  // Get player data from PlayFab
  async getPlayerData(keys: string[]): Promise<any> {
    console.log(`Getting player data for keys: ${keys.join(', ')}`);
    
    // Check if session ticket exists
    if (!this.sessionTicket) {
      console.warn('No session ticket available. User may need to login first.');
    }
    
    return new Promise((resolve, reject) => {
      const getDataRequest = {
        Keys: keys
      };
      
      PlayFab.PlayFabClient.GetUserData(
        getDataRequest,
        (result: any) => {
          if (result.data && result.data.Data) {
            const data: Record<string, string> = {};
            
            // Convert PlayFab data format to simple key-value pairs
            Object.keys(result.data.Data).forEach(key => {
              if (result.data.Data[key].Value) {
                data[key] = result.data.Data[key].Value;
              }
            });
            
            resolve({ data });
          } else {
            resolve({ data: {} });
          }
        },
        (error: any) => {
          console.error('Get player data failed:', error);
          reject(error);
        }
      );
    });
  }
  
  // Update player data in PlayFab
  async updatePlayerData(data: Record<string, string>): Promise<any> {
    console.log(`Updating player data with keys: ${Object.keys(data).join(', ')}`);
    
    // Check if session ticket exists
    if (!this.sessionTicket) {
      console.warn('No session ticket available. User may need to login first.');
      throw new Error('Authentication required');
    }
    
    return new Promise((resolve, reject) => {
      const updateDataRequest = {
        Data: data
      };
      
      PlayFab.PlayFabClient.UpdateUserData(
        updateDataRequest,
        (result: any) => {
          if (result.data) {
            resolve(result.data);
          } else {
            reject(new Error('Update player data failed: No data returned'));
          }
        },
        (error: any) => {
          console.error('Update player data failed:', error);
          reject(error);
        }
      );
    });
  }
}

export default PlayFabClient;
