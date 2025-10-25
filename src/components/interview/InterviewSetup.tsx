"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, MessageCircle, Brain, Target } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ModeSelection } from "./mode-selection";

const interviewSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  maxQuestions: z
    .number()
    .min(2, "Minimum 2 questions")
    .max(5, "Maximum 5 questions"),
});

type InterviewFormData = z.infer<typeof interviewSchema>;

export function InterviewSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InterviewFormData | null>(null);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const router = useRouter();

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
      location: "",
      description: "",
      maxQuestions: 5,
    },
  });

  const onSubmit = async (data: InterviewFormData) => {
    // Store the form data and show mode selection
    setFormData(data);
    setShowModeSelection(true);
  };

  const handleModeSelect = async (mode: "speech" | "text") => {
    if (!formData) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/interview/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          mode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Interview created! Starting now...");
        // Store the first question audio in sessionStorage for the interview page
        if (result.firstQuestion?.audioBase64) {
          sessionStorage.setItem(
            `interview_${result.interviewId}_audio`,
            JSON.stringify({
              text: result.firstQuestion.text,
              audio: result.firstQuestion.audioBase64,
            })
          );
        }
        router.push(`/interview/${result.interviewId}`);
      } else {
        toast.error(result.error || "Failed to create interview");
        setShowModeSelection(false);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
      setShowModeSelection(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (showModeSelection) {
    return (
      <div className="w-full">
        <ModeSelection
          onSelectMode={handleModeSelect}
          onBack={() => {
            setShowModeSelection(false);
            setFormData(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-balance">
          Meet Olin, Your AI Interview Coach
        </h1>
        <p className="text-lg text-muted-foreground text-balance">
          Practice realistic interviews with personalized feedback
        </p>
      </div>

      {/* Features */}
      <div className="space-y-4 mt-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-lg font-semibold">
                Realistic Interview Experience
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Practice with AI-powered questions that adapt to your responses
                and experience level.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Natural Conversations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose between voice or text mode. Speak naturally or type your
                responses with real-time AI feedback.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                Personalized to Your Role
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Provide a job description below and Olin will tailor questions
                to match the specific role.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Build Confidence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Practice as many times as you need in a safe, judgment-free
                environment.
              </p>
            </div>
          </div>
        </Card>
      </div>
      {/* Form Card */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm mt-6">
        <CardHeader>
          <CardTitle>Setup Your Interview</CardTitle>
          <CardDescription>
            Tell us about the position you are interviewing for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Senior Software Engineer"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Tech Corp"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., San Francisco, CA"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the job description here for more tailored questions..."
                        className="min-h-[150px]"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Providing a job description helps generate more relevant
                      questions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2}
                        max={5}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Choose between 2-5 questions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading || showModeSelection}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || showModeSelection}
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Start Interview"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
