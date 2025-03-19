import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PlayFabClient from '../../lib/playfabClient';
import AzureStorageClient from '../../lib/azureStorageClient';

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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize clients
  const [playfabClient] = useState(() => new PlayFabClient());
  const [azureStorageClient] = useState(() => new AzureStorageClient());

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

  // Handle file selection for avatar upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }
    
    uploadAvatar(file);
  };

  // Upload avatar to Azure Blob Storage
  const uploadAvatar = async (file: File) => {
    if (!authState.isAuthenticated) {
      setError('You must be logged in to upload an avatar');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload image to Azure Blob Storage
      const imageUrl = await azureStorageClient.uploadImage(file);
      
      // Update profile data with new avatar URL
      setProfileData(prev => ({
        ...prev,
        avatarUrl: imageUrl
      }));
      
      // Save the URL to PlayFab
      await playfabClient.updatePlayerData({
        'AvatarUrl': imageUrl
      });
      
      setSuccessMessage('Avatar uploaded successfully');
    } catch (err) {
      setError('Failed to upload avatar');
      console.error(err);
    } finally {
      setIsUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    if (!profileData.avatarUrl) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Try to delete the blob if it's from our storage
      if (profileData.avatarUrl.includes(azureStorageClient.config.accountName)) {
        await azureStorageClient.deleteBlob(profileData.avatarUrl);
      }
      
      // Update profile data
      setProfileData(prev => ({
        ...prev,
        avatarUrl: ''
      }));
      
      // Save to PlayFab
      await playfabClient.updatePlayerData({
        'AvatarUrl': ''
      });
      
      setSuccessMessage('Avatar removed successfully');
    } catch (err) {
      setError('Failed to remove avatar');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
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
            <label>Avatar</label>
            
            <div className="avatar-upload-container">
              {/* Avatar Preview */}
              <div className="avatar-preview">
                {profileData.avatarUrl ? (
                  <img 
                    src={profileData.avatarUrl} 
                    alt="Avatar Preview" 
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/default-avatar.png';
                      e.currentTarget.onerror = null;
                    }}
                  />
                ) : (
                  <div className="default-avatar">
                    <span>{profileData.displayName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="avatar-controls">
                <input
                  type="file"
                  id="avatarFile"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isUploading || isSaving}
                  style={{ display: 'none' }}
                />
                
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSaving}
                >
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
                
                {profileData.avatarUrl && (
                  <button
                    type="button"
                    className="danger-button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading || isSaving}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            
            <p className="help-text">
              Upload an image for your profile, or use the default avatar.
            </p>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="primary-button"
              disabled={isSaving || isUploading}
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
