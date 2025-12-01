"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
}

const StarfieldGlow: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        // Initialize stars with relative coordinates
        const stars: Star[] = [];
        const numStars = 400;

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random(), // Relative 0-1
                y: Math.random(), // Relative 0-1
                size: Math.random() * 2,
                opacity: Math.random(),
                speed: Math.random() * 0.05 + 0.01
            });
        }

        let animationFrameId: number;
        let time = 0;
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const render = () => {
            time += 0.01;
            ctx.fillStyle = '#050505'; // Deep dark background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Parallax offset
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const parallaxX = (mouseX - centerX) * 0.05;
            const parallaxY = (mouseY - centerY) * 0.05;

            // Draw Stars
            stars.forEach(star => {
                let x = star.x * canvas.width + parallaxX * star.speed * 20;
                let y = star.y * canvas.height + parallaxY * star.speed * 20;

                // Wrap around screen
                if (x < 0) x += canvas.width;
                if (x > canvas.width) x -= canvas.width;
                if (y < 0) y += canvas.height;
                if (y > canvas.height) y -= canvas.height;

                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity + Math.sin(time * star.speed * 10) * 0.2})`;
                ctx.arc(x, y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Glowing Dot

            // Back Glow (Outer Halo)
            const glowRadius = 150 + Math.sin(time * 2) * 10; // Pulsing effect
            const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, glowRadius);
            gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)'); // Inner blueish white
            gradient.addColorStop(0.4, 'rgba(60, 100, 255, 0.2)'); // Mid blue
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fade out

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // The Dot itself
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(200, 230, 255, 1)';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
            ctx.fill();

            // Reset shadow for next frame
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', updateSize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-black">
            <canvas ref={canvasRef} className="block" />

            {/* Optional Overlay Controls or Text */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 text-sm font-light tracking-widest pointer-events-none">
                STARFIELD VISUALIZER
            </div>
        </div>
    );
};

export default StarfieldGlow;
