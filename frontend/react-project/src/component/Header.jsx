import React from "react";
import "../css/Header.css";

function Header() {
  return (
    <div className="header">
      <div className="logo">
        <img src="./logoNew.png" alt="PIA_Logo" />
      </div>
      <h2>TalentPath</h2>
      <div className="title">
        PIA Human Resources | Recruitment and Evaluation System
      </div>
    </div>
  );
}
export default Header;