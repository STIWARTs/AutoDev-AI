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

    // We keep target angles for smooth interpolation
    const cells: { targetAngle: number; currentAngle: number; cx: number; cy: number }[] = [];
    const spacing = 35; // Pixels between each vector arrow
    
    let cols = Math.ceil(width / spacing);
    let rows = Math.ceil(height / spacing);

    const initCells = () => {
        cells.length = 0;
        cols = Math.ceil(width / spacing);
        rows = Math.ceil(height / spacing);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                cells.push({
                    cx: i * spacing + spacing / 2,
                    cy: j * spacing + spacing / 2,
                    targetAngle: 0,
                    currentAngle: 0
                });
            }
        }
    };
    initCells();

    const mouse = { x: -1000, y: -1000 };
    let isMousePresent = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
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
      initCells();
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;
      
      for (const cell of cells) {
          const { cx, cy } = cell;
          
          let dist = 1000;
          
          if (isMousePresent) {
             const dx = mouse.x - cx;
             const dy = mouse.y - cy;
             cell.targetAngle = Math.atan2(dy, dx);
             dist = Math.sqrt(dx * dx + dy * dy);
          } else {
             // Idle ambient wave motion
             cell.targetAngle = Math.sin(time + cx * 0.005) * Math.cos(time + cy * 0.005) * Math.PI;
          }

          // Smooth rotation interpolation
          // To prevent spinning the wrong way across the -PI/PI boundary:
          let diff = cell.targetAngle - cell.currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          
          cell.currentAngle += diff * 0.1;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(cell.currentAngle);
          
          // Calculate intensity based on distance from mouse
          // Max influence radius is 400px
          const intensity = isMousePresent ? Math.max(0, 1 - dist / 400) : 0;
          
          // Draw the vector line
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const lineLength = 6 + intensity * 10; // Stretches out when near cursor
          ctx.lineTo(lineLength, 0);
          
          if (intensity > 0) {
             ctx.strokeStyle = `rgba(226, 90, 52, ${0.1 + intensity * 0.8})`; // Brand accent color glow
          } else {
             ctx.strokeStyle = `rgba(161, 161, 170, 0.15)`; // Muted idle color
          }
          
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.stroke();

          // Draw the origin dot
          ctx.beginPath();
          ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = intensity > 0 ? `rgba(226, 90, 52, ${0.3 + intensity * 0.7})` : `rgba(161, 161, 170, 0.4)`;
          ctx.fill();

          ctx.restore();
      }

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
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
