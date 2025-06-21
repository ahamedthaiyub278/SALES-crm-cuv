import React, { useState } from "react";
import "./Profile.css";
import { FaArrowLeft  } from "react-icons/fa";

const Profile = () => {
  const [form, setForm] = useState({
    firstName: localStorage.getItem('name'),
    lastName: "Mehta",
    email: localStorage.getItem('email'),
    password: "********",
    confirmPassword: "********",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    alert("Profile saved!");
  };

  return (
    <div className="profile-container">
      <div className="header">
        <div className="header-content">
          <button className="back-button" onClick={() => window.history.back()}>
            <FaArrowLeft />
          </button>
          <div className="header-title">
            <h1>Profle</h1>
          </div>
          <div style={{ width: '40px' }}></div>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>First name</label>
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
        />

        

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" className="save-btn">Save</button>
      </form>
    </div>
  );
};

export default Profile;
