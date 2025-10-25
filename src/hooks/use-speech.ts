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
      recognition.continuous = false; // Single utterance mode
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      // Handle results
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

        const fullTranscript = final || interim;
        setTranscript(fullTranscript);

        if (final) {
          callbacksRef.current.onTranscript?.(final.trim());
          // Auto-restart for continuous listening experience
          if (!isUserStoppingRef.current) {
            try {
              setTimeout(() => {
                if (!isUserStoppingRef.current && recognitionRef.current) {
                  recognitionRef.current.start();
                }
              }, 300);
            } catch {
              // Already started, ignore
            }
          }
        }
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        // Restart on error if user didn't stop
        if (!isUserStoppingRef.current && recognitionRef.current) {
          try {
            setTimeout(() => {
              if (!isUserStoppingRef.current && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 300);
          } catch {
            // Already started, ignore
          }
        }
      };

      // Handle end
      recognition.onend = () => {
        // Only update state if user explicitly stopped
        if (isUserStoppingRef.current) {
          setIsListening(false);
          callbacksRef.current.onListeningChange?.(false);
          setTranscript("");
          isUserStoppingRef.current = false;
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setTranscript("");
    setIsListening(true);
    callbacksRef.current.onListeningChange?.(true);
    recognitionRef.current.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    isUserStoppingRef.current = true;
    recognitionRef.current.stop();
    setIsListening(false);
    callbacksRef.current.onListeningChange?.(false);
  }, []);

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
    speak,
    stopSpeaking,
  };
}
