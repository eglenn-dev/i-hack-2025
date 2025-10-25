"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MessageSquare, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface ModeSelectionProps {
  onSelectMode: (mode: "speech" | "text") => void;
  onBack?: () => void;
}

export function ModeSelection({ onSelectMode, onBack }: ModeSelectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"speech" | "text" | null>(
    null
  );

  const handleModeClick = (mode: "speech" | "text") => {
    setIsLoading(true);
    setSelectedMode(mode);
    onSelectMode(mode);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">
            Interview Practice Assistant
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Choose how you&apos;d like to practice your interview skills
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Speech Mode */}
          <Card
            className="p-8 space-y-4 hover:border-primary transition-all cursor-pointer group bg-card/50 backdrop-blur-sm"
            onClick={() => handleModeClick("speech")}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Speech Mode</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Practice with voice interaction. Speak naturally and receive
                audio responses from the AI interviewer.
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={isLoading && selectedMode !== "speech"}
              onClick={(e) => {
                e.stopPropagation();
                handleModeClick("speech");
              }}
            >
              {isLoading && selectedMode === "speech"
                ? "Starting..."
                : "Start Speaking"}
            </Button>
          </Card>

          {/* Text Mode */}
          <Card
            className="p-8 space-y-4 hover:border-primary transition-all cursor-pointer group bg-card/50 backdrop-blur-sm"
            onClick={() => handleModeClick("text")}
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <MessageSquare className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Text Mode</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Practice with text-based chat. Type your responses and read the
                AI interviewer&apos;s questions.
              </p>
            </div>
            <Button
              className="w-full"
              variant="secondary"
              size="lg"
              disabled={isLoading && selectedMode !== "text"}
              onClick={(e) => {
                e.stopPropagation();
                handleModeClick("text");
              }}
            >
              {isLoading && selectedMode === "text"
                ? "Starting..."
                : "Start Typing"}
            </Button>
          </Card>
        </div>

        {/* Back Button */}
        {onBack && !isLoading && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Setup
            </Button>
          </div>
        )}

        {/* AI Disclaimer */}
        <Card className="p-6 bg-muted/30 border-muted">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">AI Disclaimer</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI can make mistakes. Please verify important information and
                use this tool as practice, not as a replacement for professional
                career advice.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
