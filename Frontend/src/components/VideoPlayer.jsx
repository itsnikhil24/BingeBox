import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import "./VideoPlayer.css";
import { Volume1, Volume2, VolumeX } from "lucide-react";

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 🔥 HLS Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels;
        const q = levels.map((level, index) => ({
          index,
          label: `${level.height}p`,
        }));
        setQualities(q);
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src]);

  // ▶️ Play / Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // ⏱ Time Update
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    setProgress((video.currentTime / video.duration) * 100);
    setCurrentTime(video.currentTime);
  };

  // 📦 Buffer Update
  const handleProgress = () => {
    const video = videoRef.current;
    if (!video || !video.duration || video.buffered.length === 0) return;

    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    setBuffered((bufferedEnd / video.duration) * 100);
  };

  // 🎯 Seek
  const handleSeek = (e) => {
    const video = videoRef.current;
    const value = e.target.value;
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  // 🔊 Volume
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // 🔇 Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted || volume === 0) {
      video.volume = 1;
      setVolume(1);
      setIsMuted(false);
    } else {
      video.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };

  // 🖥 Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.log);
    } else {
      document.exitFullscreen();
    }
  };

  // 🎯 Auto-hide controls
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };
    const container = containerRef.current;
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [isPlaying]);

  // 🔥 FIXED QUALITY CHANGE (IMPORTANT)
  const changeQuality = (levelIndex) => {
    const video = videoRef.current;
    const hls = hlsRef.current;

    if (!hls || !video) return;

    const wasPlaying = !video.paused;
    const currentTime = video.currentTime;

    video.pause(); // ✅ Pause first

    hls.currentLevel = levelIndex; // 🔄 Change quality

    hls.once(Hls.Events.LEVEL_SWITCHED, () => {
      video.currentTime = currentTime; // ✅ restore time

      if (wasPlaying) {
        video.play(); // ▶ resume
        setIsPlaying(true);
      }
    });

    setCurrentQuality(levelIndex);
  };

  // ⏰ Format Time
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="video-container" ref={containerRef}>
      <video
        ref={videoRef}
        className="video"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={() => {
          setDuration(videoRef.current.duration);
        }}
        onClick={togglePlay}
      />

      {!isPlaying && (
        <div className="center-play" onClick={togglePlay}>
          ▶
        </div>
      )}

      <div className={`controls ${showControls ? "show" : ""}`}>
        <div className="progress-container">
          <div className="progress-loaded" style={{ width: `${buffered}%` }} />
          <div className="progress-played" style={{ width: `${progress}%` }} />
          <input
            type="range"
            className="seek"
            value={progress}
            onChange={handleSeek}
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div className="controls-row">
          <div className="left">
            <button onClick={togglePlay}>
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <div className="volume-container">
              <button onClick={toggleMute}>
                {volume === 0 || isMuted ? (
                  <VolumeX size={20} />
                ) : volume > 0.5 ? (
                  <Volume2 size={20} />
                ) : (
                  <Volume1 size={20} />
                )}
              </button>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>

            <span className="time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="right">
            <select
              value={currentQuality}
              onChange={(e) => changeQuality(Number(e.target.value))}
            >
              <option value={-1}>Auto</option>
              {qualities.map((q) => (
                <option key={q.index} value={q.index}>
                  {q.label}
                </option>
              ))}
            </select>
            <button onClick={toggleFullscreen}>⛶</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;