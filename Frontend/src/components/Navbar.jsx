import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilm, FaSearch, FaUpload, FaUserCircle } from "react-icons/fa";
import "./navbar.css";

export default function Navbar({ openUpload, isLoggedIn }) {
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleUploadClick = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    openUpload();
  };

  return (
    <nav className="navbar">

      {/* Left */}
      <div className="navbar-left">
        <FaFilm className="logo-icon" />
        <h2 className="logo-text">
          Binge<span className="logo-accent">Box</span>
        </h2>
      </div>

      {/* Center */}
      <div className="navbar-center">
        <div className="search-box">
          <input type="text" placeholder="Search videos..." />
          <button className="search-button" aria-label="Search">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">
        <div className="upload-wrapper">
          <button className="upload-btn" onClick={handleUploadClick}>
            <FaUpload />
            <span>Upload</span>
          </button>

          {showLoginPrompt && (
            <div className="login-prompt">
              <span>You are not logged in.</span>
              <button
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                Login to upload
              </button>
              <button
                className="prompt-close"
                onClick={() => setShowLoginPrompt(false)}
                aria-label="Dismiss"
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