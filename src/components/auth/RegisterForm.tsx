import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!email || !password || !confirmPassword || !displayName) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(email, password, displayName);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <div className="auth-form register-form">
      <h2>Create Account</h2>
      
      {formError && <div className="error-message">{formError}</div>}
      {authState.error && <div className="error-message">{authState.error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={authState.isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={authState.isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authState.isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={authState.isLoading}
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="primary-button"
            disabled={authState.isLoading}
          >
            {authState.isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
