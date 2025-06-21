import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUser, FiCheckSquare, FiClipboard } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  return (
    <div className="bottom-nav">
      <NavLink to="/" className="nav-item">
        <FiHome className="nav-icon" />
        <span className="nav-text">Home</span>
      </NavLink>
      <NavLink to="/leads" className="nav-item">
        <FiClipboard className="nav-icon" />
        <span className="nav-text">Leads</span>
      </NavLink>
      <NavLink to="/tasks" className="nav-item">
        <FiCheckSquare className="nav-icon" />
        <span className="nav-text">Tasks</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <FiUser className="nav-icon" />
        <span className="nav-text">Profile</span>
      </NavLink>
    </div>
  );
};

export default Navbar;
