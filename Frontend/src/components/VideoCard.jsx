import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import "./videocard.css";

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  // Default thumbnail
  const thumbnail =
    video.thumbnail_url ||
    "https://placehold.co/1280x720/201b23/F5F1E8?text=No+Thumbnail";

  const uploader =
    video.profiles?.full_name ||
    video.profiles?.username ||
    "Unknown Creator";

  const uploadDate = new Date(video.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="video-card"
      onClick={() => navigate(`/watch/${video.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className="video-thumb-wrap">
        <img src={thumbnail} alt={video.title} className="video-thumbnail" />
        <div className="play-overlay">
          <FaPlay />
        </div>
      </div>

      {/* Ticket-stub perforation */}
      <div className="stub-tear" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="tear-dot" />
        ))}
      </div>

      <div className="video-info">
        <div className="channel-avatar">
          {uploader.charAt(0).toUpperCase()}
        </div>

        <div className="video-details">
          <h3 className="video-title">{video.title}</h3>
          <p className="creator">{uploader}</p>
          <p className="upload-date">{uploadDate}</p>
        </div>
      </div>
    </div>
  );
}