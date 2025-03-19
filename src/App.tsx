import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'game' | 'profile' | 'auth'>('auth');
  
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
        return <Auth />;
    }
  };

  return (
    <AuthProvider>
      <GameProvider>
        <div className="App">
          <header className="App-header">
            <h1>React SPA PlayFab</h1>
            <nav>
              <button onClick={() => navigate('home')}>Home</button>
              <button onClick={() => navigate('game')}>Game</button>
              <button onClick={() => navigate('profile')}>Profile</button>
              <button onClick={() => navigate('auth')}>Login/Register</button>
            </nav>
          </header>
          <main>
            {renderPage()}
          </main>
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
