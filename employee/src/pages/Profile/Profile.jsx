import React, { useState } from "react";
import "./Profile.css";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeaderProfle from "../../components/HeaderProfle";

const Profile = () => {
  const [form, setForm] = useState({
    firstName: localStorage.getItem("name") || "",
    lastName: localStorage.getItem("name"),
    email: localStorage.getItem("email") || "",
    password: "********",
    confirmPassword: "********",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile saved!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("id");

    navigate("/login");
  };

  return (
    <div className="profile-container">
      <HeaderProfle />

      {/* Logout Button - Positioned Top Right or Below Header */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 20px" }}>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: "6px" }} />
          Logout
        </button>
      </div>

      <div className="profile-logo">
        <div className="logo-circle">
          {form.firstName ? form.firstName.charAt(0).toUpperCase() : "U"}
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label> name</label>
        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          disabled
          value={form.password}
          onChange={handleChange}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          disabled
          onChange={handleChange}
        />

        <button type="submit" className="save-btn">
          Save
        </button>
      </form>
    </div>
  );
};

export default Profile;
