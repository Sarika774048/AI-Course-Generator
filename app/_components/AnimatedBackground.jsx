"use client";
import Particles from "react-tsparticles";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-300 to-indigo-400 animate-gradientShift"></div>

      {/* Floating Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-pink-400 rounded-full opacity-30 animate-blob mix-blend-multiply"></div>
      <div className="absolute top-20 right-[-10%] w-96 h-96 bg-purple-400 rounded-full opacity-20 animate-blob animation-delay-2000 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-400 rounded-full opacity-25 animate-blob animation-delay-4000 mix-blend-multiply"></div>

      {/* Particles */}
      <Particles
        className="absolute inset-0 -z-10"
        options={{
          background: { color: "transparent" },
          fpsLimit: 60,
          interactivity: { events: { onHover: { enable: true, mode: "repulse" } } },
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, color: "#fff", distance: 150 },
            move: { enable: true, speed: 1 },
            number: { value: 50 },
            opacity: { value: 0.2 },
            size: { value: 3 },
          },
        }}
      />
    </div>
  );
}
