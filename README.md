# AI Interview Practice MVP

A text-based AI interview practice application where users can conduct mock interviews with an AI interviewer. The system provides real-time interaction, saves conversation history, and grades interview performance.

## Features

- **Email OTP Authentication**: Secure passwordless login with JWT sessions
- **Interview Setup**: Customize interviews by job title, company, location, and description
- **AI-Powered Questions**: Dynamic question generation using Google Gemini API
- **Text-to-Speech**: AI interviewer speaks questions using Gemini's TTS with natural voice (Zephyr)
- **Text-Based Interview**: Practice interviews with text responses
- **Automatic Grading**: AI-powered performance evaluation with detailed feedback
- **Interview History**: Review past interviews with full transcripts and grades
- **Performance Stats**: Track your progress with average grades and statistics

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: MongoDB with connection pooling
- **Authentication**: JWT-based session management with email OTP
- **Email Service**: Resend
- **AI Services**: Google Gemini API
- **Deployment**: Vercel-ready

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A MongoDB database (MongoDB Atlas recommended)
- A Resend account for email sending
- A Google Gemini API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `MONGO_CONNECTION_STRING` - MongoDB connection string
- `RESEND_API_KEY` - Resend API key for sending emails
- `GEMINI_API_KEY` - Google Gemini API key
- `SECRET_KEY` - Random 32+ character string for JWT signing
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for development)

### 3. Get Your API Keys

#### MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string

#### Resend
1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Note: For development, use `onboarding@resend.dev` as the sender email

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Sign In
- Enter your email address
- Check your email for the 6-digit OTP code
- Enter the code to log in

### 2. Start a New Interview
- From the dashboard, click "Start Interview"
- Fill in the interview details
- Click "Start Interview"

### 3. Conduct the Interview
- Read the AI-generated question
- Type your response
- Press Ctrl+Enter or click "Submit Answer"

### 4. View Results
- After completing the interview, view your grade and feedback
- Review the full transcript

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

## License

MIT
