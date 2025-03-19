import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PlayFabClient from '../../lib/playfabClient';

interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

const ProfileForm: React.FC = () => {
  const { authState } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    bio: '',
    avatarUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const playfabClient = new PlayFabClient();

  // Define loadProfileData with useCallback to avoid dependency cycle
  const loadProfileData = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await playfabClient.getPlayerData(['DisplayName', 'Bio', 'AvatarUrl']);
      
      setProfileData({
        displayName: result.data['DisplayName'] || authState.user?.displayName || '',
        bio: result.data['Bio'] || '',
        avatarUrl: result.data['AvatarUrl'] || ''
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authState.user, playfabClient]);

  // Load profile data when component mounts
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadProfileData();
    }
  }, [authState.isAuthenticated, authState.user, loadProfileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.isAuthenticated) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await playfabClient.updatePlayerData({
        'DisplayName': profileData.displayName,
        'Bio': profileData.bio,
        'AvatarUrl': profileData.avatarUrl
      });
      
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="profile-form">
        <p>Please log in to view and edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-form">
      <h2>Edit Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {isLoading ? (
        <p>Loading profile data...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleInputChange}
              disabled={isSaving}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              disabled={isSaving}
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="avatarUrl">Avatar URL</label>
            <input
              type="text"
              id="avatarUrl"
              name="avatarUrl"
              value={profileData.avatarUrl}
              onChange={handleInputChange}
              disabled={isSaving}
            />
            <p className="help-text">
              Enter a URL to an image, or leave blank to use the default avatar.
            </p>
          </div>
          
          {profileData.avatarUrl ? (
            <div className="avatar-preview">
              <img 
                src={profileData.avatarUrl} 
                alt="Avatar Preview" 
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/default-avatar.png';
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
          ) : (
            <div className="avatar-preview">
              <div className="default-avatar">
                <span>{profileData.displayName.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;
