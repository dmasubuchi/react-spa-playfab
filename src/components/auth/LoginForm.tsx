import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="auth-form login-form">
      <h2>Login</h2>
      
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
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="primary-button"
            disabled={authState.isLoading}
          >
            {authState.isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
