import React from "react";
import Navbar from "./components/Navbar";
import VideoPlayer from "./components/VideoPlayer";
import AnimatedBackground from "./components/AnimatedBackground";

export default function App() {
  return (
    <div>
      <AnimatedBackground /> 
      {/* Navbar at top */}
      <Navbar />

      {/* Video Player */}
      <div style={{ padding: "20px" }}>
        <VideoPlayer src="http://localhost:3000/videos/video_1781702510585/master.m3u8" />
      </div>
    </div>
  );
}

// /Users/nikhilsharma/Documents/Projects/BingeBox/Backend/output/video_