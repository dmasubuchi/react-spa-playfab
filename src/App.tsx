import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import './App.css';

// Navigation component with authentication awareness
const Navigation: React.FC<{
  currentPage: string;
  navigate: (page: 'home' | 'game' | 'profile' | 'auth') => void;
}> = ({ currentPage, navigate }) => {
  const { authState, logout } = useAuth();
  
  return (
    <nav className="app-navigation">
      <button 
        className={currentPage === 'home' ? 'active' : ''} 
        onClick={() => navigate('home')}
      >
        Home
      </button>
      
      <button 
        className={currentPage === 'game' ? 'active' : ''} 
        onClick={() => navigate('game')}
      >
        Game
      </button>
      
      <button 
        className={currentPage === 'profile' ? 'active' : ''} 
        onClick={() => navigate('profile')}
      >
        Profile
      </button>
      
      {authState.isAuthenticated ? (
        <button 
          className="auth-button"
          onClick={logout}
        >
          Logout
        </button>
      ) : (
        <button 
          className={currentPage === 'auth' ? 'active auth-button' : 'auth-button'} 
          onClick={() => navigate('auth')}
        >
          Login/Register
        </button>
      )}
    </nav>
  );
};

// App content with navigation and page rendering
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'game' | 'profile' | 'auth'>('home');
  
  // Simple navigation function
  const navigate = (page: 'home' | 'game' | 'profile' | 'auth') => {
    setCurrentPage(page);
  };

  // Render the current page based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'game':
        return <Game />;
      case 'profile':
        return <Profile />;
      case 'auth':
        return <Auth />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React SPA PlayFab</h1>
        <Navigation currentPage={currentPage} navigate={navigate} />
      </header>
      <main className="App-main">
        {renderPage()}
      </main>
      <footer className="App-footer">
        <p>PlayFab Integration Demo &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
