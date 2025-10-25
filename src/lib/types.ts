export interface UserSession {
    userId: string;
    email: string;
    name: string;
    profilePictureUrl: string;
    role: string;
    expires: Date;
}

export interface Message {
    role: "assistant" | "user";
    content: string;
    audioUrl?: string;
    timestamp: Date;
}

export interface GradingCriteria {
    clarity: number; // 25% - How clear and articulate
    relevance: number; // 25% - How well answers match questions
    depth: number; // 20% - Level of detail provided
    examples: number; // 15% - Use of specific examples
    confidence: number; // 15% - Tone and delivery
}
