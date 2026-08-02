import { useState } from "react";
import { FaCloudUploadAlt, FaFileVideo, FaTimes } from "react-icons/fa";
import { uploadVideo } from "../services/videoService";
import "./uploadmodal.css";

export default function UploadModal({ close, refreshVideos }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!video) {
      alert("Please select a video.");
      return;
    }

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please login first.");
        return;
      }

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("user_id", user.id);
      formData.append("video", video);

      await uploadVideo(formData);

      alert("Video uploaded successfully!");

      refreshVideos();

      close();
    } catch (err) {
      console.log(err);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>

      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Upload Video</h2>
          <button className="close-btn" onClick={close} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <label className="field-label" htmlFor="bb-title">Title</label>
        <input
          id="bb-title"
          type="text"
          placeholder="Give your video a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="field-label" htmlFor="bb-desc">Description</label>
        <textarea
          id="bb-desc"
          placeholder="What's this video about?"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="field-label">Video file</label>
        <label className="dropzone">
          <input
            type="file"
            accept="video/mp4,video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            hidden
          />
          {video ? (
            <span className="dropzone-selected">
              <FaFileVideo />
              {video.name}
            </span>
          ) : (
            <span className="dropzone-empty">
              <FaCloudUploadAlt />
              Click to choose a video, or drag one here
            </span>
          )}
        </label>

        <div className="buttons">
          <button className="cancel-btn" onClick={close}>
            Cancel
          </button>

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

      </div>

    </div>
  );
}