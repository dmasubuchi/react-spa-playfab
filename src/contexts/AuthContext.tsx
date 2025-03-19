import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PlayFabClient from '../lib/playfabClient';

// Define the shape of our authentication state
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    playFabId?: string;
    displayName?: string;
    sessionTicket?: string;
  } | null;
  error: string | null;
}

// Define the shape of our context
interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial authentication state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
};

// PlayFab client instance
const playfabClient = new PlayFabClient();

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Check for existing session on mount
  useEffect(() => {
    // TODO: Implement session persistence if needed
    // This could involve checking localStorage for a saved session ticket
    // and validating it with PlayFab
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await playfabClient.loginWithEmailAddress(email, password);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          playFabId: result.playFabId,
          displayName: result.displayName,
          sessionTicket: result.sessionTicket,
        },
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  // Register function
  const register = async (email: string, password: string, displayName: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await playfabClient.registerPlayFabUser(email, password, displayName);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          playFabId: result.playFabId,
          displayName: displayName,
          sessionTicket: result.sessionTicket,
        },
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  };

  // Logout function
  const logout = () => {
    playfabClient.clearSessionTicket();
    setAuthState(initialAuthState);
  };

  // Clear error function
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
