"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  audioBase64: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onAudioLevel?: (level: number) => void;
}

export function AudioPlayer({
  audioBase64,
  autoPlay = false,
  onEnded,
  onPlay,
  onPause,
  onAudioLevel,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioRef.current && audioBase64) {
      // Create audio blob from base64
      const audioData = `data:audio/wav;base64,${audioBase64}`;
      audioRef.current.src = audioData;

      if (autoPlay) {
        audioRef.current.play().catch((error) => {
          console.error("Error auto-playing audio:", error);
        });
      }
    }
  }, [audioBase64, autoPlay]);

  // Setup audio analysis on play
  const setupAudioAnalysis = () => {
    if (!audioRef.current) return;

    try {
      const AudioContextClass =
        (window.AudioContext as typeof AudioContext) ||
        (window as unknown as Record<string, typeof AudioContext>)
          .webkitAudioContext;

      let audioContext = audioContextRef.current;

      // Create a new context if needed
      if (!audioContext) {
        audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaElementSource(audioRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyserRef.current = analyser;
      }

      // Resume context if suspended
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (
          analyserRef.current &&
          audioRef.current &&
          !audioRef.current.paused
        ) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = average / 255; // 0 to 1
          onAudioLevel?.(normalizedLevel);
          animationIdRef.current = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        onPlay={() => {
          setIsPlaying(true);
          setupAudioAnalysis();
          onPlay?.();
        }}
        onPause={() => {
          setIsPlaying(false);
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          onAudioLevel?.(0);
          onPause?.();
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          onAudioLevel?.(0);
          onEnded?.();
        }}
      />
      <Button onClick={togglePlay} size="sm" variant="outline">
        {isPlaying ? "Pause" : "Play Question"}
      </Button>
      <Button onClick={toggleMute} size="sm" variant="ghost">
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
