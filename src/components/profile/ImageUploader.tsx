import React, { useState, useRef } from 'react';
import AzureStorageClient from '../../lib/azureStorageClient';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
}

/**
 * Image Uploader Component
 * Allows users to upload profile images to Azure Blob Storage
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, currentImageUrl }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageClient = new AzureStorageClient();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be less than 2MB');
      return;
    }
    
    // Create local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    
    // Upload to Azure Blob Storage
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const imageUrl = await storageClient.uploadImage(file);
      onImageUploaded(imageUrl);
      console.log('Image uploaded successfully:', imageUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setUploadError('Failed to upload image. Please try again.');
      // Keep the local preview even if upload fails
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="image-uploader">
      <div className="image-preview-container">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Profile Preview" 
            className="image-preview"
            onError={() => {
              setPreviewUrl('/assets/images/default-avatar.png');
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      
      <div className="upload-controls">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        <button
          type="button"
          onClick={handleSelectImage}
          disabled={isUploading}
          className="upload-button"
        >
          {isUploading ? 'Uploading...' : 'Select Image'}
        </button>
        
        {uploadError && (
          <div className="upload-error">
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
