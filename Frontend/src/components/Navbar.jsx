import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo">MyPlayer</h2>
      </div>

      <div className="navbar-center">
        <a href="#">Home</a>
        <a href="#">Movies</a>
        <a href="#">Series</a>
        <a href="#">Live</a>
      </div>

      <div className="navbar-right">
        <button className="login-btn">Login</button>
      </div>
    </nav>
  );
};

export default Navbar;