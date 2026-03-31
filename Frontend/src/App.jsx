import React from "react";
import Navbar from "./components/Navbar";
import VideoPlayer from "./components/VideoPlayer";

export default function App() {
  return (
    <div>
      {/* Navbar at top */}
      <Navbar />

      {/* Video Player */}
      <div style={{ padding: "20px" }}>
        <VideoPlayer src="http://localhost:3000/videos/video_1774172186487/master.m3u8" />
      </div>
    </div>
  );
}