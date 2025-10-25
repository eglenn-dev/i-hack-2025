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
  onstart?: (() => void) | null;
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedTranscriptRef = useRef("");
  const isSupported = isSpeechSupported();

  // Store callbacks in refs to avoid recreating recognition
  const onTranscriptRef = useRef(onTranscript);
  const onListeningChangeRef = useRef(onListeningChange);

  // Update callback refs when they change
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onListeningChangeRef.current = onListeningChange;
  }, [onListeningChange]);

  // Initialize recognition only once
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = ((window as unknown as Record<string, unknown>)
      .SpeechRecognition ||
      (window as unknown as Record<string, unknown>)
        .webkitSpeechRecognition) as unknown as
      | { new (): SpeechRecognition }
      | undefined;

    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log("Speech result event received");
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(
          `Result ${i}:`,
          transcript,
          "Final:",
          event.results[i].isFinal
        );

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }

      // If we have final results, accumulate them
      if (finalTranscript) {
        accumulatedTranscriptRef.current += finalTranscript;
        console.log(
          "Updated accumulated transcript:",
          accumulatedTranscriptRef.current
        );
        onTranscriptRef.current(accumulatedTranscriptRef.current.trim());
      }
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          console.error("Microphone permission denied");
        }
      }
    };

    // Handle end
    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
      onListeningChangeRef.current?.(false);
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Already stopped
        }
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      console.warn("Speech recognition not supported or not initialized");
      return;
    }

    console.log("Starting speech recognition");
    accumulatedTranscriptRef.current = "";
    setIsListening(true);
    onListeningChangeRef.current?.(true);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
      onListeningChangeRef.current?.(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    console.log("Stopping speech recognition");
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }

    setIsListening(false);
    onListeningChangeRef.current?.(false);
  }, []);

  const pauseListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.abort();
    } catch {
      // Already stopped
    }
  }, []);

  const resumeListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      recognitionRef.current.start();
    } catch {
      // Already started
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
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    speak,
    stopSpeaking,
  };
}
