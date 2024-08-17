import React from 'react';
import './Header.css';
const Header = ({ name, profilePic, onLogout }) => (
  <div className="header-container">
    <div className="user-info">
      <img src={profilePic} alt="User" className="user-image" />
      <span className="user-name">{name}</span>
    </div>
    <button onClick={onLogout} className="logout-button">Logout</button>
  </div>
);

export default Header;
