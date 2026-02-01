<div align="center">
    <h1>Olin</h1>
    <p>Welcome to Olin, an AI interview assistant. Made for the future of AI-driven interviews.</p>
    <p></p>
    <p>
        <img alt="TypeScript" src="https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
        <img alt="React" src="https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=white" />
        <img alt="Next.js" src="https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js&logoColor=white" />
        <img alt="Tailwind CSS" src="https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
        <img alt="Vercel" src="https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
        <img alt="shadcn/ui" src="https://img.shields.io/badge/-shadcn%2Fui-111827?style=flat-square&logo=shadcnui&logoColor=white" />
    </p>
</div>

> [!NOTE]
> This project was awarded first place in the BYU-Idaho I-Hack 2025 competition. [Learn more](https://ethanglenn.dev/blog/i-hack-25).

## Features

- **AI-Powered Mock Interviews**: Conduct realistic practice interviews with AI-generated questions tailored to your job role
- **Dual Interview Modes**:
    - **Text Mode**: Type your answers for a traditional interview experience
    - **Speech Mode**: Practice verbal communication with voice input/output for authentic interview simulation
- **Google Gemini Integration**: Leverages Gemini 2.5 Flash for intelligent question generation and Gemini TTS for natural voice synthesis
- **Smart Question Generation**: Dynamic interview questions based on job title, company, and description with adaptive follow-ups
- **Real-time Audio Processing**: Live audio visualization with animated blob interface during voice interviews
- **Automated Interview Grading**: Comprehensive feedback system that evaluates responses on clarity, relevance, depth, examples, and confidence
- **Interview History**: Track and review past interview sessions with detailed feedback and scores
- **Secure Authentication**: Email-based OTP verification system with session management using JWT tokens
- **Responsive Design**: Fully responsive interface that works seamlessly across desktop and mobile devices

## Technologies Used

- **Next.js 16**: React framework with App Router for server-side rendering and API routes
- **React 19**: Modern React with hooks for building interactive UI components
- **TypeScript**: Type-safe development for improved code quality and developer experience
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: High-quality, accessible React component library built on Radix UI
- **Google Gemini AI**: Advanced AI models for question generation (Gemini 2.5 Flash) and text-to-speech (Gemini TTS Preview)
- **MongoDB**: NoSQL database for storing user data, interviews, and conversation history
- **Jose**: JWT token handling for secure session management
- **React Hook Form + Zod**: Form management with schema validation
- **Web Speech API**: Browser-based speech recognition for voice input
- **React Email + Resend**: Email template creation and delivery for OTP authentication
- **Vercel Analytics**: Performance monitoring and user analytics
- **Lucide React**: Beautiful, consistent icon library
- **Sonner**: Elegant toast notifications for user feedback

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/eglenn-dev/i-hack-2025.git
    ```
2. Navigate to the project directory:
    ```bash
    cd i-hack-2025
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the development server:

    ```bash
    npm run dev
    ```

5. Open your browser and go to `http://localhost:3000`.
