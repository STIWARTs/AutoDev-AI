"use client";

import { useEffect, useRef } from "react";

export function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    let isMousePresent = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      isMousePresent = true;
    };
    
    const handleMouseOut = () => {
      isMousePresent = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      // Smooth interpolation for mouse
      if (!isMousePresent) {
         // Ambient wandering when mouse is away
         mouse.targetX = width / 2 + Math.sin(time) * 300;
         mouse.targetY = height / 2 + Math.cos(time * 0.8) * 200;
      }
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const gridSize = 40;
      
      // Subtle parallax shift based on mouse position
      // This makes the entire grid gently shift in the opposite direction of the mouse
      const parallaxX = (mouse.x / width - 0.5) * -40;
      const parallaxY = (mouse.y / height - 0.5) * -40;

      // Draw grid
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      // Calculate start and end points including parallax offset
      const startX = (parallaxX % gridSize) - gridSize;
      const startY = (parallaxY % gridSize) - gridSize;

      for (let x = startX; x <= width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = startY; y <= height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      
      // Muted technical grid color
      ctx.strokeStyle = "rgba(161, 161, 170, 0.4)"; 
      ctx.stroke();

      // Apply the flashlight mask using destination-in
      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 600
      );
      // Center is fully opaque, edges fade to transparent
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add a subtle brand-colored ambient glow over the focused area of the grid
      ctx.globalCompositeOperation = "source-over";
      const ambientGlow = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 400
      );
      ambientGlow.addColorStop(0, "rgba(226, 90, 52, 0.1)"); // Subtle brand accent
      ambientGlow.addColorStop(1, "rgba(226, 90, 52, 0)");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
