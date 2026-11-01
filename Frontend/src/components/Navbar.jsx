import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFilm,
  FaSignOutAlt,
  FaSearch,
  FaUpload,
  FaUserCircle,
} from "react-icons/fa";

import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({
  openUpload,
  openAuth,
}) {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("You have been logged out.");
  };

  const handleUploadClick = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    openUpload();
  };

  const handleLoginClick = () => {
    setShowLoginPrompt(false);
    openAuth();
  };

  return (
    <nav className="navbar">

      {/* Left */}
      <Link to="/dashboard" className="navbar-left">
        <FaFilm className="logo-icon" />

        <h2 className="logo-text">
          Binge<span className="logo-accent">Box</span>
        </h2>
      </Link>

      {/* Center */}
      <div className="navbar-center">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search videos..."
          />

          <button
            className="search-button"
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">

        <div className="upload-wrapper">

          <button
            className="upload-btn"
            onClick={handleUploadClick}
          >
            <FaUpload />
            <span>Upload</span>
          </button>

          {showLoginPrompt && !isLoggedIn && (
            <div className="login-prompt">

              <span>
                You are not logged in.
              </span>

              <button
                className="login-btn"
                onClick={handleLoginClick}
              >
                Login to upload
              </button>

              <button
                className="prompt-close"
                onClick={() => setShowLoginPrompt(false)}
                aria-label="Close"
              >
                ×
              </button>

            </div>
          )}

        </div>

        {isLoggedIn ? (
          <div className="user-menu">
            <FaUserCircle className="profile-icon" />

            <span className="user-name">
              {user.username || user.fullName || user.email}
            </span>

            <button
              className="logout-btn"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            className="signin-btn"
            onClick={openAuth}
          >
            <FaUserCircle />
            <span>Login</span>
          </button>
        )}

      </div>
    </nav>
  );
}