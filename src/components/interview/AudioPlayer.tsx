"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
    audioBase64: string;
    autoPlay?: boolean;
    onEnded?: () => void;
}

export function AudioPlayer({ audioBase64, autoPlay = false, onEnded }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

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
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    onEnded?.();
                }}
            />
            <Button onClick={togglePlay} size="sm" variant="outline">
                {isPlaying ? "Pause" : "Play Question"}
            </Button>
            <Button onClick={toggleMute} size="sm" variant="ghost">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
        </div>
    );
}
