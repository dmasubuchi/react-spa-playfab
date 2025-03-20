import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <>
            <LoginForm />
            <p className="auth-toggle">
              Don't have an account?{' '}
              <button className="text-button" onClick={toggleAuthMode}>
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm />
            <p className="auth-toggle">
              Already have an account?{' '}
              <button className="text-button" onClick={toggleAuthMode}>
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
