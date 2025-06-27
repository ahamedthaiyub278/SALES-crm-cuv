import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEdit, FiSave, FiBriefcase } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const name_ie = localStorage.getItem('name')
  const [userData, setUserData] = useState({
    name: "Ahamed Thaiyub ",
    email: "ahamedthaiyub27@gmail.com",
    password: '********',
    role: 'Admin',
    phone: '123456789',
    department: 'Management'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({ ...userData });

  const handleEdit = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData({ ...tempData });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1><FiUser className="header-icon" /> User Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="settings-card">
        <div className="card-header">
          <h2>Profile Information</h2>
          {!isEditing ? (
            <button onClick={handleEdit} className="edit-btn">
              <FiEdit /> Edit Profile
            </button>
          ) : (
            <button onClick={handleSave} className="save-btn">
              <FiSave /> Save Changes
            </button>
          )}
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label htmlFor="name">
              <FiUser className="input-icon" /> Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                id="name"
                name="name"
                value={tempData.name}
                onChange={handleChange}
              />
            ) : (
              <div className="display-value">{userData.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FiMail className="input-icon" /> Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                id="email"
                name="email"
                value={tempData.email}
                onChange={handleChange}
              />
            ) : (
              <div className="display-value">{userData.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FiLock className="input-icon" /> Password
            </label>
            {isEditing ? (
              <input
                type="password"
                id="password"
                name="password"
                value={tempData.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            ) : (
              <div className="display-value">{userData.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                id="phone"
                name="phone"
                value={tempData.phone}
                onChange={handleChange}
              />
            ) : (
              <div className="display-value">{userData.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">
              <FiBriefcase className="input-icon" /> Role
            </label>
            {isEditing ? (
              <select
                id="role"
                name="role"
                value={tempData.role}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="Guest">Guest</option>
              </select>
            ) : (
              <div className="display-value">{userData.role}</div>
            )}
          </div>

        
        </div>
      </div>

      <div className="settings-footer">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Settings;