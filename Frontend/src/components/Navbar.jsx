import { FaFilm, FaSearch, FaUpload, FaUserCircle } from "react-icons/fa";
import "./navbar.css";

export default function Navbar({ openUpload }) {
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
        <button className="upload-btn" onClick={openUpload}>
          <FaUpload />
          <span>Upload</span>
        </button>

        <FaUserCircle className="profile-icon" />
      </div>

    </nav>
  );
}