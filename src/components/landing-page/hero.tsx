"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedBlob } from "../interview/animated-blop";
import { useState, useRef, useEffect } from "react";

export function Hero() {
  const [blobState, setBlobState] = useState<
    "idle" | "listening" | "speaking" | "thinking"
  >("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const setupAudioAnalysis = () => {
    if (!audioRef.current) return;

    try {
      const AudioContextClass =
        (window.AudioContext as typeof AudioContext) ||
        (window as unknown as Record<string, typeof AudioContext>)
          .webkitAudioContext;

      let audioContext = audioContextRef.current;

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
          const normalizedLevel = average / 255;
          setAudioLevel(normalizedLevel);
          animationIdRef.current = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
    }
  };

  const playAudio = (fileName: string) => {
    if (audioRef.current) {
      audioRef.current.src = fileName;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <section className="container mx-auto px-4 py-12 md:py-32">
      <audio
        ref={audioRef}
        onPlay={() => {
          setBlobState("speaking");
          setIsPlaying(true);
          setupAudioAnalysis();
        }}
        onPause={() => {
          setBlobState("idle");
          setIsPlaying(false);
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          setAudioLevel(0);
        }}
        onEnded={() => {
          setBlobState("idle");
          setIsPlaying(false);
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          setAudioLevel(0);
        }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            AI-Powered Interview Preparation
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content - Left side */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Ace Your Next Interview with AI
            </h1>

            <p className="text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
              Generate tailored interview questions from any job description and
              practice with our AI interviewer. Get real-time feedback and build
              confidence before the big day.
            </p>

            <div className="flex flex-col items-center lg:items-start justify-center lg:justify-start gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Start Practicing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {/* <Button size="lg" variant="outline">
                                Watch Demo
                            </Button> */}
            </div>
          </div>

          {/* Blob - Right side */}
          <div className="flex flex-col items-center justify-center gap-6">
            <AnimatedBlob state={blobState} audioLevel={audioLevel} />
            <Button
              onClick={() => playAudio("/audio/fillers/olin-intro.wav")}
              size="lg"
              disabled={isPlaying}
            >
              Meet Olin
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
