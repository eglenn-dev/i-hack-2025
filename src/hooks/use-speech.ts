import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface UseSpeechProps {
  onTranscript: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

const isSpeechSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  );
};

export function useSpeech({ onTranscript, onListeningChange }: UseSpeechProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const callbacksRef = useRef({ onTranscript, onListeningChange });
  const isUserStoppingRef = useRef(false);
  const isUserStartedRef = useRef(false); // Track if user explicitly started
  const accumulatedTranscriptRef = useRef(""); // Track accumulated text
  const isPausedRef = useRef(false); // Track if paused (vs stopped)
  const isSupported = isSpeechSupported();

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onTranscript, onListeningChange };
  }, [onTranscript, onListeningChange]);

  // Initialize recognition only once
  useEffect(() => {
    if (!isSupported) return;

    // Check browser support
    const SpeechRecognition = ((window as unknown as Record<string, unknown>)
      .SpeechRecognition ||
      (window as unknown as Record<string, unknown>)
        .webkitSpeechRecognition) as unknown as
      | { new (): SpeechRecognition }
      | undefined;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;

      // Configure recognition
      recognition.continuous = true; // Keep listening continuously
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      // Handle results - only if user started
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            final += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        // Show both accumulated final + current interim
        const displayText = (
          accumulatedTranscriptRef.current +
          " " +
          final +
          interim
        ).trim();
        setTranscript(displayText);

        if (final) {
          // Accumulate the final transcript
          accumulatedTranscriptRef.current = (
            accumulatedTranscriptRef.current +
            " " +
            final
          ).trim();
          callbacksRef.current.onTranscript?.(accumulatedTranscriptRef.current);
        }
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Don't log "aborted" errors - they're expected when we pause/stop
        if (event.error !== "aborted") {
          console.error("Speech recognition error:", event.error);
        }
      };

      // Handle end
      recognition.onend = () => {
        // Only restart if user explicitly started and didn't stop
        if (isUserStartedRef.current && !isUserStoppingRef.current) {
          // Restart if not user stopped - recognition ended unexpectedly
          try {
            recognition.start();
          } catch {
            // Already started, ignore
          }
        } else if (isUserStoppingRef.current) {
          // User explicitly stopped
          setIsListening(false);
          callbacksRef.current.onListeningChange?.(false);
          setTranscript("");
          accumulatedTranscriptRef.current = ""; // Clear accumulated transcript
          isUserStoppingRef.current = false;
          isUserStartedRef.current = false;
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Already aborted, ignore
        }
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setTranscript("");
    accumulatedTranscriptRef.current = ""; // Reset accumulated transcript
    isUserStartedRef.current = true; // Mark that user started
    isUserStoppingRef.current = false; // Make sure stopping flag is false
    setIsListening(true);
    callbacksRef.current.onListeningChange?.(true);

    try {
      recognitionRef.current.start();
    } catch (error) {
      // If it fails, the recognition object might be in a bad state
      console.error("Failed to start recognition:", error);
      // Try to recreate it
      const SpeechRecognition = ((window as unknown as Record<string, unknown>)
        .SpeechRecognition ||
        (window as unknown as Record<string, unknown>)
          .webkitSpeechRecognition) as unknown as
        | { new (): SpeechRecognition }
        | undefined;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + " ";
            } else {
              interim += transcript;
            }
          }
          const displayText = (
            accumulatedTranscriptRef.current +
            " " +
            final +
            interim
          ).trim();
          setTranscript(displayText);
          if (final) {
            accumulatedTranscriptRef.current = (
              accumulatedTranscriptRef.current +
              " " +
              final
            ).trim();
            callbacksRef.current.onTranscript?.(
              accumulatedTranscriptRef.current
            );
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
          if (isUserStartedRef.current && !isUserStoppingRef.current) {
            try {
              recognition.start();
            } catch {
              // Already started, ignore
            }
          } else if (isUserStoppingRef.current) {
            setIsListening(false);
            callbacksRef.current.onListeningChange?.(false);
            setTranscript("");
            accumulatedTranscriptRef.current = "";
            isUserStoppingRef.current = false;
            isUserStartedRef.current = false;
          }
        };

        try {
          recognition.start();
        } catch {
          console.error("Failed to start recreated recognition");
        }
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    isUserStartedRef.current = false; // Mark that user stopped
    isUserStoppingRef.current = true;
    recognitionRef.current.stop();
    setIsListening(false);
    callbacksRef.current.onListeningChange?.(false);
  }, []);

  const pauseListening = useCallback(() => {
    if (!recognitionRef.current || !isUserStartedRef.current) return;
    isPausedRef.current = true; // Mark as paused
    try {
      recognitionRef.current.abort();
    } catch {
      // Already stopped, ignore
    }
  }, []);

  const resumeListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    // Only resume if user started and didn't stop (but paused is okay)
    if (
      isUserStartedRef.current &&
      !isUserStoppingRef.current &&
      isPausedRef.current
    ) {
      isPausedRef.current = false; // Mark as resumed
      try {
        recognitionRef.current.start();
      } catch {
        // Already started, ignore
      }
    }
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    speak,
    stopSpeaking,
  };
}
