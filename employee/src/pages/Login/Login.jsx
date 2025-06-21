import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiLogIn } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("https://sales-backend-mern-production.up.railway.app/api/auth/login", {
        email,
        password,
        type: "employee", 
      });

      const { token, user } = res.data;
      
      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("name", user.name);  
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);
      localStorage.setItem("id", user._id);

      // Force refresh of auth state
      window.location.href = "/";
      
      // Alternative (if you don't want full reload):
      // navigate("/", { replace: true });
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Invalid credentials. Please try again.";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <FaBuilding className="company-icon" />
          <h1>Enterprise Portal</h1>
          <p>Secure Employee Access</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <div className="input-icon">
              <FiMail />
            </div>
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <FiLock />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Keep me signed in</span>
            </label>
            <a href="/reset-password" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <FiLogIn className="button-icon" />
                <span>Sign In</span>
              </>
            )}
          </button>

          <div className="login-footer">
            <p>Need an account? <a href="/request-access">Request access</a></p>
            <p className="copyright">© {new Date().getFullYear()} Enterprise Inc.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;