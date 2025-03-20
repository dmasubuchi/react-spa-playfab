import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PlayFabClient from '../../lib/playfabClient';

interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

/**
 * Profile Manager Component
 * Allows users to view and edit their profile information
 */
const ProfileManager: React.FC = () => {
  const { authState } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: authState.user?.displayName || '',
    bio: '',
    avatarUrl: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [playfabClient] = useState(() => new PlayFabClient());
  
  // Load profile data
  const loadProfileData = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await playfabClient.getPlayerData(['DisplayName', 'Bio', 'AvatarUrl']);
      
      setProfileData({
        displayName: result.data['DisplayName'] || authState.user?.displayName || '',
        bio: result.data['Bio'] || '',
        avatarUrl: result.data['AvatarUrl'] || '',
      });
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authState.user, playfabClient]);
  
  // Load profile data on initial mount
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadProfileData();
    }
  }, [authState.isAuthenticated, loadProfileData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await playfabClient.updatePlayerData({
        'DisplayName': profileData.displayName,
        'Bio': profileData.bio,
        'AvatarUrl': profileData.avatarUrl,
      });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!authState.isAuthenticated) {
    return (
      <div className="profile-manager">
        <h2>Profile</h2>
        <p>Please log in to view and edit your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="profile-manager">
      <h2>Edit Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {isLoading ? (
        <div className="loading">Loading profile data...</div>
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
              type="url"
              id="avatarUrl"
              name="avatarUrl"
              value={profileData.avatarUrl}
              onChange={handleInputChange}
              disabled={isSaving}
              placeholder="https://example.com/avatar.jpg"
            />
            
            {profileData.avatarUrl && (
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
            )}
          </div>
          
          <button 
            type="submit" 
            className="primary-button"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
          
          <button
            type="button"
            className="secondary-button"
            onClick={loadProfileData}
            disabled={isLoading || isSaving}
          >
            Reload Profile
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileManager;
