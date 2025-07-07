import React from "react";
import "../css/Header.css";

function Header({ onMenuToggle }) {
  return (
    <div className="header">
      <button className="mobile-menu-toggle" onClick={onMenuToggle}>
        <i className="fas fa-bars"></i>
      </button>
      <div className="logo">
        <img src="/logoNew.png" alt="PIA_Logo" />
      </div>
      <h2 className="header-title">TalentPath</h2>
      <div className="header-subtitle">
        PIA Human Resources | Recruitment and Evaluation System
      </div>
    </div>
  );
}
export default Header;
