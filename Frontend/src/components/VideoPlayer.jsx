import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import "./VideoPlayer.css";
import {
  Play,
  Pause,
  Volume1,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // HLS Setup
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

  // Play / Pause
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

  // Time Update
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    setProgress((video.currentTime / video.duration) * 100);
    setCurrentTime(video.currentTime);
  };

  // Buffer Update
  const handleProgress = () => {
    const video = videoRef.current;
    if (!video || !video.duration || video.buffered.length === 0) return;

    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    setBuffered((bufferedEnd / video.duration) * 100);
  };

  // Seek
  const handleSeek = (e) => {
    const video = videoRef.current;
    const value = e.target.value;
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  // Volume
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Mute
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

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.log);
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls
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

  // Quality change
  const changeQuality = (levelIndex) => {
    const video = videoRef.current;
    const hls = hlsRef.current;

    if (!hls || !video) return;

    const wasPlaying = !video.paused;
    const currentTime = video.currentTime;

    video.pause();

    hls.currentLevel = levelIndex;

    hls.once(Hls.Events.LEVEL_SWITCHED, () => {
      video.currentTime = currentTime;

      if (wasPlaying) {
        video.play();
        setIsPlaying(true);
      }
    });

    setCurrentQuality(levelIndex);
  };

  // Format Time
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
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onLoadedMetadata={() => {
          setDuration(videoRef.current.duration);
          setIsLoading(false);
        }}
        onClick={togglePlay}
      />

      {isLoading && (
        <div className="buffer-spinner" aria-hidden="true">
          <span className="spinner-ring" />
        </div>
      )}

      {!isPlaying && !isLoading && (
        <button className="center-play" onClick={togglePlay} aria-label="Play">
          <Play size={30} fill="currentColor" />
        </button>
      )}

      <div className={`controls ${showControls ? "show" : ""}`}>
        <div className="progress-container">
          <div className="progress-loaded" style={{ width: `${buffered}%` }} />
          <div className="progress-played" style={{ width: `${progress}%` }} />
          <div
            className="progress-thumb"
            style={{ left: `${progress}%` }}
            aria-hidden="true"
          />
          <input
            type="range"
            className="seek"
            value={progress}
            onChange={handleSeek}
            min="0"
            max="100"
            step="0.1"
            aria-label="Seek"
          />
        </div>

        <div className="controls-row">
          <div className="left">
            <button
              className="icon-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <div className="volume-container">
              <button
                className="icon-btn"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {volume === 0 || isMuted ? (
                  <VolumeX size={18} />
                ) : volume > 0.5 ? (
                  <Volume2 size={18} />
                ) : (
                  <Volume1 size={18} />
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
                aria-label="Volume"
              />
            </div>

            <span className="time">
              {formatTime(currentTime)} <span className="time-sep">/</span>{" "}
              {formatTime(duration)}
            </span>
          </div>

          <div className="right">
            <div className="quality-select">
              <Settings size={15} className="quality-icon" />
              <select
                value={currentQuality}
                onChange={(e) => changeQuality(Number(e.target.value))}
                aria-label="Quality"
              >
                <option value={-1}>Auto</option>
                {qualities.map((q) => (
                  <option key={q.index} value={q.index}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="icon-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;