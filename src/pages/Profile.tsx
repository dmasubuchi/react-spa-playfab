import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-container">
        <div className="profile-image">
          <div className="image-placeholder">
            <span>Profile Image</span>
          </div>
          <button className="upload-button">Upload Image</button>
        </div>
        <div className="profile-details">
          <div className="form-group">
            <label>Display Name</label>
            <input type="text" placeholder="Enter display name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" disabled />
          </div>
          <div className="form-group">
            <button className="save-button">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
