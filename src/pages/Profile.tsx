import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';

const Profile: React.FC = () => {
  const { authState, logout } = useAuth();

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      
      {authState.isAuthenticated ? (
        <div className="profile-container">
          <div className="profile-header">
            <h2>Welcome, {authState.user?.displayName || 'Player'}</h2>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
          
          <ProfileForm />
        </div>
      ) : (
        <div className="profile-container">
          <p>Please log in to view and edit your profile.</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
