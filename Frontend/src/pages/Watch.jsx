import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "../components/Navbar";
import VideoPlayer from "../components/VideoPlayer";
import AuthDialog from "../components/AuthDialog";
import UploadModal from "../components/UploadModal";
import { getVideoById } from "../services/videoService";
import { getCurrentUser } from "../utils/auth";
import "./watch.css";

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchVideo = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getVideoById(id);
        if (isMounted) setVideo(data);
      } catch (err) {
        console.log(err);
        if (isMounted) setError("This video couldn't be loaded.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVideo();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleOpenUpload = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      setShowAuth(true);
      return;
    }

    setShowUpload(true);
  };

  const handleOpenAuth = () => {
    setShowAuth(true);
  };

  const handleAuthChange = (open) => {
    setShowAuth(open);

    if (!open) {
      setUser(getCurrentUser());
    }
  };

  const uploader =
    video?.profiles?.full_name || video?.profiles?.username || "Unknown Creator";

  const uploadDate = video?.created_at
    ? new Date(video.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <>
      <Navbar
        openUpload={handleOpenUpload}
        openAuth={handleOpenAuth}
        isLoggedIn={!!user}
      />

      <div className="watch-page">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back to feed
        </button>

        {loading ? (
          <div className="watch-skeleton">
            <div className="skeleton-player" />
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-line skeleton-line-long" />
          </div>
        ) : error ? (
          <div className="watch-error">
            <h2>Playback unavailable</h2>
            <p>{error}</p>
            <Link to="/dashboard" className="back-to-dashboard">
              Return to dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="player-frame">
              <VideoPlayer src={video.master_playlist} />
            </div>

            <div className="watch-info">
              <h1 className="watch-title">{video.title}</h1>

              <div className="watch-meta">
                <div className="channel-avatar">
                  {uploader.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="uploader-name">{uploader}</p>
                  <p className="upload-date">{uploadDate}</p>
                </div>
              </div>

              {video.description && (
                <p className="watch-description">{video.description}</p>
              )}
            </div>
          </>
        )}
      </div>

      {showUpload && user && (
        <UploadModal
          close={() => setShowUpload(false)}
          refreshVideos={() => {
            setShowUpload(false);
            navigate("/dashboard");
          }}
        />
      )}

      <AuthDialog
        open={showAuth}
        onOpenChange={handleAuthChange}
        initialMode="login"
      />
    </>
  );
}
