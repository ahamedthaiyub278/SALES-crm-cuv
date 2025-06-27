import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiSettings, 
  FiUser,
  FiLogOut 
} from 'react-icons/fi';
import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    // For example, clear auth tokens, user data, etc.
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar__logo">
        <Link to="/">
          <span className="logo-text">AHAMED</span>
          <span className="logo-highlight">CRM</span>
        </Link>
      </div>

      <nav className="sidebar__nav">
        <ul className="nav__list">
          <li className={`nav__item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <Link to="/dashboard" className="nav__link">
              <FiHome className="nav__icon" />
              <span className="nav__text">Dashboard</span>
            </Link>
          </li>
          <li className={`nav__item ${location.pathname === '/leads' ? 'active' : ''}`}>
            <Link to="/leads" className="nav__link">
              <FiBriefcase className="nav__icon" />
              <span className="nav__text">Leads</span>
            </Link>
          </li>
          <li className={`nav__item ${location.pathname === '/employees' ? 'active' : ''}`}>
            <Link to="/employees" className="nav__link">
              <FiUsers className="nav__icon" />
              <span className="nav__text">Employees</span>
            </Link>
          </li>
          <li className={`nav__item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Link to="/settings" className="nav__link">
              <FiSettings className="nav__icon" />
              <span className="nav__text">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar__footer">
         <button onClick={handleLogout} className="profile-link">
          <FiLogOut className="profile-icon" />
          <span>Logout</span>
        </button>
        <Link 
          to="/settings" 
          className={`profile-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          <FiUser className="profile-icon" />
          <span>Profile</span>
        </Link>
       
      </div>
    </div>
  );
};

export default Sidebar;