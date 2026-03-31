import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js'; // Import HLS.js
import './VideoPlayer.css';

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // --- NEW: HLS Initialization ---
  useEffect(() => {
    const video = videoRef.current;
    let hls;

    if (src) {
      // 1. Check if the browser supports hls.js
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest loaded, video ready to play.');
        });
      } 
      // 2. Fallback for Safari (which supports HLS natively)
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    }

    // Cleanup function when the component unmounts
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  // --- Control Functions (Same as before) ---
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    if (!isNaN(currentProgress)) {
      setProgress(currentProgress);
    }
  };

  const handleSeek = (event) => {
    const manualChange = Number(event.target.value);
    videoRef.current.currentTime = (videoRef.current.duration / 100) * manualChange;
    setProgress(manualChange);
  };

  const handleVolumeChange = (event) => {
    const newVolume = Number(event.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="video-container" ref={playerContainerRef}>
      <video
        ref={videoRef}
        className="video-element"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay} 
        /* Notice we removed src={src} here, hls.js handles it now! */
      />

      {/* Custom Controls Overlay (Same as before) */}
      <div className="custom-controls">
        <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        <input type="range" className="seek-bar" value={progress} onChange={handleSeek} min="0" max="100" />
        <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
        <input type="range" className="volume-bar" value={volume} onChange={handleVolumeChange} min="0" max="1" step="0.05" />
        <button onClick={toggleFullScreen}>Full Screen</button>
      </div>
    </div>
  );
};

export default VideoPlayer; 