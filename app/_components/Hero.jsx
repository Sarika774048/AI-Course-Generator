"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const Hero = () => {
  const { isSignedIn } = useUser(); 
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Run only on client — no SSR → no hydration mismatch
    const generated = Array.from({ length: 30 }).map(() => ({
      width: `${Math.random() * 6 + 3}px`,
      height: `${Math.random() * 6 + 3}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
    }));

    setParticles(generated);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      {/* Floating Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full opacity-25 blur-3xl animate-blob pointer-events-none"></div>
      <div className="absolute top-32 -right-28 w-[28rem] h-[28rem] bg-pink-400 rounded-full opacity-25 blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-400 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000 pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-yellow-300 rounded-full opacity-15 blur-2xl animate-blob animation-delay-3000 pointer-events-none"></div>

      {/* Floating particles (CLIENT ONLY) */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-20 animate-pulse"
            style={p}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl px-8 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
          AI{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-textGradient">
            COURSE GENERATOR
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-900 font-medium max-w-2xl mx-auto mb-10 animate-fadeInUp">
          Unlock personalized learning with our AI-driven course generator. <br />
          Tailor-made paths to master new skills efficiently.
        </p>

        <div className="flex justify-center">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up?redirect_url=/dashboard"}
            className="relative rounded-full bg-indigo-600 px-12 py-4 text-white font-bold hover:bg-indigo-700 transition transform hover:scale-105 hover:shadow-xl animate-fadeInUp animation-delay-500"
          >
            {isSignedIn ? "Go to Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-pink-50/10 to-purple-50/10 pointer-events-none z-0"></div>
    </section>
  );
};

export default Hero;
