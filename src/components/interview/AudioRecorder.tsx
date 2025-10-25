"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface AudioRecorderProps {
    onRecordingComplete: (transcript: string) => void;
    isRecording: boolean;
    onToggleRecording: () => void;
}

export function AudioRecorder({
    onRecordingComplete,
    isRecording,
    onToggleRecording,
}: AudioRecorderProps) {
    const [hasPermission, setHasPermission] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        // Request microphone permission on component mount
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => setHasPermission(true))
            .catch(() => setHasPermission(false));
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

                // For MVP, we'll use Web Speech API for transcription
                // In production, you'd send this to a proper transcription service

                // For now, simulate transcription with a simple prompt
                const reader = new FileReader();
                reader.onloadend = () => {
                    // In a real implementation, you'd send this to a transcription API
                    // For MVP, we'll use a placeholder text or browser's speech recognition
                    onRecordingComplete("User response recorded"); // Placeholder
                };
                reader.readAsDataURL(audioBlob);

                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    const handleToggle = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
        onToggleRecording();
    };

    if (!hasPermission) {
        return (
            <div className="text-center p-4">
                <p className="text-red-600">Microphone permission required</p>
                <Button
                    onClick={() => {
                        navigator.mediaDevices
                            .getUserMedia({ audio: true })
                            .then(() => setHasPermission(true))
                            .catch(() => setHasPermission(false));
                    }}
                    className="mt-2"
                >
                    Grant Permission
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <Button
                onClick={handleToggle}
                size="lg"
                className={`w-24 h-24 rounded-full ${
                    isRecording
                        ? "bg-red-600 hover:bg-red-700 animate-pulse"
                        : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>
        </div>
    );
}
