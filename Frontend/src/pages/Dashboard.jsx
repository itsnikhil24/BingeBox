import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import VideoCard from "../components/VideoCard";
import UploadModal from "../components/UploadModal";
import { getAllVideos } from "../services/videoService";
import { getCurrentUser } from "../utils/auth";
import "./dashboard.css";

export default function Dashboard() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [user, setUser] = useState(null);

    const fetchVideos = async () => {
        try {
            const data = await getAllVideos();
            setVideos(data);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(getCurrentUser());
        fetchVideos();
    }, []);

    const handleOpenUpload = () => {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert("Please login to upload a video.");
            // or: navigate("/login") if you're using react-router
            return;
        }

        setShowUpload(true);
    };
    

    return (
        <>
            <Navbar isLoggedIn={!!user} openUpload={handleOpenUpload} />

            <div className="dashboard">

                <div className="dashboard-header">
                    <h1>Now Screening</h1>
                    {!loading && (
                        <p className="video-count">
                            {videos.length} {videos.length === 1 ? "video" : "videos"} in the feed
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="video-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-thumb" />
                                <div className="skeleton-line skeleton-line-short" />
                                <div className="skeleton-line skeleton-line-long" />
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="empty-state">
                        <h2>No screenings yet</h2>
                        <p>Upload your first video to fill this feed.</p>
                    </div>
                ) : (
                    <div className="video-grid">
                        {videos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                            />
                        ))}
                    </div>
                )}

            </div>

            {showUpload && user && (
                <UploadModal
                    close={() => setShowUpload(false)}
                    refreshVideos={fetchVideos}
                />
            )}
        </>
    );
}