import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const blobs = [
      { x: 0.2,  y: 0.3,  radius: 320, r: 168, g: 85,  b: 247, vx: 0.00015,  vy: 0.00010  },
      { x: 0.7,  y: 0.2,  radius: 360, r: 59,  g: 130, b: 246, vx: -0.00012, vy: 0.00014  },
      { x: 0.8,  y: 0.75, radius: 340, r: 236, g: 72,  b: 153, vx: 0.00010,  vy: -0.00012 },
      { x: 0.35, y: 0.8,  radius: 280, r: 34,  g: 197, b: 94,  vx: -0.00010, vy: -0.00008 },
    ];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawBlob = (blob, time, width, height) => {
      // FIX: Removed the '* 1000' so the movement scales smoothly over time
      const cx = blob.x * width  + Math.sin(time * blob.vx) * 150;
      const cy = blob.y * height + Math.cos(time * blob.vy) * 150;
      const { r, g, b, radius } = blob;

      // ADDED: A gentle, slow pulsing effect based on time and the blob's initial position
      const pulse = Math.sin(time * 0.0005 + blob.x * 10) * 30; 
      const currentRadius = radius + pulse;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius);
      gradient.addColorStop(0,   `rgba(${r},${g},${b},0.55)`);
      gradient.addColorStop(0.4, `rgba(${r},${g},${b},0.25)`);
      gradient.addColorStop(0.7, `rgba(${r},${g},${b},0.08)`);
      gradient.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      // Ensure radius doesn't drop below 0 if you change parameters later
      ctx.arc(cx, cy, Math.max(currentRadius, 0), 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (time) => {
      const width  = window.innerWidth;
      const height = window.innerHeight;

      // Dark base gradient
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#09090f");
      bg.addColorStop(1, "#111126");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Blobs with additive blending
      ctx.globalCompositeOperation = "lighter";
      for (const blob of blobs) {
        drawBlob(blob, time, width, height);
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}