import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFilm,
  FaSearch,
  FaUpload,
  FaUserCircle,
} from "react-icons/fa";

import "./Navbar.css";

export default function Navbar({
  openUpload,
  openAuth,
  isLoggedIn,
}) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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

        <FaUserCircle className="profile-icon" />

      </div>
    </nav>
  );
}