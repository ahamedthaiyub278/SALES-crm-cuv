import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiLogIn } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("ahamedthaiyub27@gmail.com");
  const [password, setPassword] = useState("Ahamed Madurai");
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
      
   
      localStorage.setItem("token", token);
      localStorage.setItem("name", user.name);  
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);
      localStorage.setItem("id", user._id);

     
      window.location.href = "/";
      
      
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
          <h1>Ahamed CRM</h1>
          <p>Secure Employee Access</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-header">
            <h2>Sign In</h2>
            
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

          
        </form>
      </div>
    </div>
  );
};

export default Login;