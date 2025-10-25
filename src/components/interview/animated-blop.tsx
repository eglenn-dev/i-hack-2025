"use client";

import { useEffect, useState } from "react";

type BlobState = "idle" | "listening" | "speaking" | "thinking";

interface AnimatedBlobProps {
  state: BlobState;
  audioLevel?: number;
}

export function AnimatedBlob({ state, audioLevel = 0 }: AnimatedBlobProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let animationId: number | null = null;

    const updateScale = () => {
      if (state === "speaking") {
        // React to audio level in real-time
        const audioScale = 0.8 + (audioLevel || 0) * 0.5;
        setScale(audioScale);
      } else if (state === "listening") {
        setScale(1.1);
      } else if (state === "thinking") {
        // Gentle pulse for thinking
        setScale(1 + Math.sin(Date.now() / 500) * 0.1);
      } else {
        setScale(1);
      }

      animationId = requestAnimationFrame(updateScale);
    };

    updateScale();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [state, audioLevel]);

  const getBlobColor = () => {
    switch (state) {
      case "listening":
        return "bg-blue-500";
      case "speaking":
        return "bg-blue-600";
      case "thinking":
        return "bg-blue-400";
      default:
        return "bg-blue-300";
    }
  };

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-300 ${getBlobColor()}`}
        style={{
          transform: `scale(${scale * 1.2})`,
        }}
      />

      {/* Scale wrapper (React controlled) */}
      <div
        style={{
          transform: `scale(${scale})`,
        }}
      >
        {/* Main blob (CSS animation controlled) */}
        <div
          className={`relative w-48 h-48 md:w-64 md:h-64 ${getBlobColor()} blob-animate shadow-2xl`}
          style={{
            aspectRatio: "1",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
        >
          {/* Inner highlight */}
          <div className="absolute inset-8 bg-linear-to-br from-white/20 to-transparent rounded-full blur-xl" />
        </div>
      </div>

      {/* Particle effects for speaking state */}
      {state === "speaking" && (
        <>
          <div
            className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping"
            style={{ top: "20%", left: "30%" }}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping animation-delay-200"
            style={{ top: "30%", right: "25%" }}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping animation-delay-400"
            style={{ bottom: "25%", left: "25%" }}
          />
        </>
      )}
    </div>
  );
}
