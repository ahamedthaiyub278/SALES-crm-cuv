import React, { useEffect, useState } from 'react';
import {BrowserRouter as Router,Routes,Route,useLocation,Navigate} from 'react-router-dom';

import Sidebar from './components/Sidebar/Sidebar';
import Leads from './pages/leads/Leads';
import Employees from './pages/employee/employee';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './pages/settingspage/settings';
import LoadingScreen from './components/LoadingScreen';

import './App.css';

const AppContent = () => {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }, [location.pathname]);

  const hideSidebar = location.pathname === '/login';

  if (!authChecked) return <LoadingScreen />;

  return (
    <div style={{ display: 'flex' }}>
      {!hideSidebar && isAuthenticated && <Sidebar />}
      <div
        style={{
          flex: 1,
          padding: '20px',
          marginLeft: !hideSidebar && isAuthenticated ? '50px' : '0',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Routes>
          {/* Login route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />

          {/* Protected Routeeeeee */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Leads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Redirectssssssssss */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
