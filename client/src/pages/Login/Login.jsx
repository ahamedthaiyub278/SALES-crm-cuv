
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiAlertTriangle,
  FiUsers,
  FiKey,
  FiX
} from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('ahamed@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState(null);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('https://sales-backend-mern-production.up.railway.app/api/auth/login', {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('name', user.name);
      localStorage.setItem('email', user.email);
      localStorage.setItem('role', user.role);
      localStorage.setItem('id', user._id);

      if (user.role === 'manager') navigate('/manager/home');
      else if (user.role === 'employee') navigate('/');
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeLogin = () => {
    window.open('https://employeeloginsales.netlify.app', '_blank');
  };

  if (loginType === null) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>

        <div className="login-selection-box">
          <div className="login-header">
            <div className="logo"><span>Ahamed</span> CRM</div>
            <h2>Welcome to CRM System</h2>
            <p>Select your login type</p>
          </div>

          <div className="login-options">
            <button
              className="login-option-button admin"
              onClick={() => setLoginType('admin')}
            >
              <FiKey className="option-icon" />
              <span>Admin Login</span>
            </button>

            <button
              className="login-option-button employee"
              onClick={handleEmployeeLogin}
            >
              <FiUsers className="option-icon" />
              <span>Employee Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <form className="login-box" onSubmit={handleAdminLogin}>
        <div className="login-header">
          <div className="logo"><span>Ahamed</span> CRM</div>
          <button
            type="button"
            className="back-button"
            onClick={() => setLoginType(null)}
          >
            <FiX />
          </button>
          <h2>Welcome Back Admin</h2>
          <p>Enter your credentials to sign in</p>
        </div>

        {error && (
          <div className="error-message">
            <FiAlertTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="input-group">
          <FiUser className="input-icon" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled
          />
          <div className="input-border"></div>
        </div>

        <div className="input-group">
          <FiLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
          <div className="input-border"></div>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? (
            <>
              <FiLoader className="spin" />
              Signing In...
            </>
          ) : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
