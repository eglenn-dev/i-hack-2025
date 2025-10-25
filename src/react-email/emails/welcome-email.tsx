import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
    Link,
    Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
    userName?: string;
}

export default function WelcomeEmail({
    userName = "there",
}: WelcomeEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head />
            <Preview>Welcome to Olin - Your AI Interview Coach</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                background: "oklch(0.98 0.005 264)",
                                foreground: "oklch(0.2 0.02 264)",
                                primary: "oklch(0.45 0.15 264)",
                                "primary-foreground": "oklch(0.98 0.005 264)",
                                accent: "oklch(0.65 0.18 200)",
                                muted: "oklch(0.95 0.005 264)",
                                "muted-foreground": "oklch(0.5 0.01 264)",
                                border: "oklch(0.88 0.01 264)",
                            },
                            fontFamily: {
                                sans: ["Geist", "ui-sans-serif", "system-ui"],
                                mono: [
                                    "Geist Mono",
                                    "ui-monospace",
                                    "monospace",
                                ],
                            },
                            borderRadius: {
                                lg: "1rem",
                                xl: "1.25rem",
                            },
                        },
                    },
                }}
            >
                <Body className="bg-[oklch(0.98_0.005_264)] font-sans py-10">
                    <Container className="bg-white rounded-xl shadow-lg max-w-[600px] mx-auto p-10 border border-[oklch(0.88_0.01_264)]">
                        {/* Header with Brand Icon */}
                        <Section className="text-center mb-8">
                            <div className="inline-block bg-blue-600 rounded-lg p-3 mb-4">
                                <Text className="text-[24px] m-0 text-white">
                                    Olin
                                </Text>
                            </div>
                            <Heading className="text-[32px] font-bold text-[oklch(0.2_0.02_264)] m-0 mb-2">
                                Welcome to Olin!
                            </Heading>
                            <Text className="text-[16px] text-[oklch(0.5_0.01_264)] m-0">
                                Your AI Interview Coach
                            </Text>
                        </Section>

                        {/* Welcome Message */}
                        <Section className="mb-6">
                            <Text className="text-[15px] text-[oklch(0.2_0.02_264)] leading-6 m-0 mb-4">
                                Hi {userName},
                            </Text>
                            <Text className="text-[15px] text-[oklch(0.2_0.02_264)] leading-6 m-0 mb-4">
                                Welcome to Olin! We&apos;re excited to help you
                                ace your next interview. Practice realistic
                                interviews, get instant feedback, and land your
                                dream job with confidence.
                            </Text>
                        </Section>

                        {/* Features Section */}
                        <Section className="mb-6">
                            <Heading className="text-[20px] font-bold text-[oklch(0.2_0.02_264)] m-0 mb-4">
                                What you can do with Olin:
                            </Heading>

                            {/* Feature 1 */}
                            <div className="mb-4">
                                <div className="flex items-start">
                                    {/* <div className="bg-[oklch(0.95_0.005_264)] rounded-lg p-2 mr-3">
                                        <Text className="text-[16px] m-0">
                                            🎯
                                        </Text>
                                    </div> */}
                                    <div>
                                        <Text className="text-[14px] font-semibold text-[oklch(0.2_0.02_264)] m-0 mb-1">
                                            AI-Generated Questions
                                        </Text>
                                        <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0">
                                            Paste any job description and get
                                            tailored interview questions
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="mb-4">
                                <div className="flex items-start">
                                    {/* <div className="bg-[oklch(0.95_0.005_264)] rounded-lg p-2 mr-3">
                                        <Text className="text-[16px] m-0">
                                            🎤
                                        </Text>
                                    </div> */}
                                    <div>
                                        <Text className="text-[14px] font-semibold text-[oklch(0.2_0.02_264)] m-0 mb-1">
                                            Speech & Text Modes
                                        </Text>
                                        <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0">
                                            Practice with voice or text - choose
                                            what works best for you
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="mb-4">
                                <div className="flex items-start">
                                    {/* <div className="bg-[oklch(0.95_0.005_264)] rounded-lg p-2 mr-3">
                                        <Text className="text-[16px] m-0">
                                            📊
                                        </Text>
                                    </div> */}
                                    <div>
                                        <Text className="text-[14px] font-semibold text-[oklch(0.2_0.02_264)] m-0 mb-1">
                                            Instant Feedback & Grading
                                        </Text>
                                        <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0">
                                            Get detailed performance insights
                                            and scores after each interview
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="mb-4">
                                <div className="flex items-start">
                                    {/* <div className="bg-[oklch(0.95_0.005_264)] rounded-lg p-2 mr-3">
                                        <Text className="text-[16px] m-0">
                                            📈
                                        </Text>
                                    </div> */}
                                    <div>
                                        <Text className="text-[14px] font-semibold text-[oklch(0.2_0.02_264)] m-0 mb-1">
                                            Track Your Progress
                                        </Text>
                                        <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0">
                                            Monitor your improvement with
                                            detailed stats and history
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* CTA Button */}
                        <Section className="text-center mb-6">
                            <Button
                                href="https://olin.help/dashboard"
                                className="bg-[oklch(0.45_0.15_264)] text-white rounded-lg py-3 px-6 text-[14px] font-semibold no-underline inline-block"
                            >
                                Start Your First Interview
                            </Button>
                        </Section>

                        {/* Getting Started Section */}
                        <Section className="mb-6">
                            <div className="bg-[oklch(0.95_0.005_264)] rounded-lg p-4 border border-[oklch(0.88_0.01_264)]">
                                <Text className="text-[14px] font-semibold text-[oklch(0.2_0.02_264)] m-0 mb-2">
                                    🚀 Quick Start Guide:
                                </Text>
                                <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0 mb-1">
                                    1. Enter the job details you&apos;re
                                    preparing for
                                </Text>
                                <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0 mb-1">
                                    2. Choose how many questions (2-5)
                                </Text>
                                <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0 mb-1">
                                    3. Select speech or text mode
                                </Text>
                                <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0">
                                    4. Start practicing and get instant feedback
                                </Text>
                            </div>
                        </Section>

                        <Hr className="border border-[oklch(0.88_0.01_264)] my-6" />

                        {/* Footer Message */}
                        <Section className="mb-4">
                            <Text className="text-[13px] text-[oklch(0.5_0.01_264)] m-0 text-center">
                                Questions or feedback? We&apos;d love to hear
                                from you.
                            </Text>
                        </Section>

                        {/* Footer */}
                        <Section className="text-center">
                            <Text className="text-[12px] text-[oklch(0.5_0.01_264)] m-0">
                                &copy; {new Date().getFullYear()}{" "}
                                <Link
                                    href="https://olin.help"
                                    className="text-[oklch(0.45_0.15_264)] no-underline"
                                >
                                    Olin.help
                                </Link>
                                . All rights reserved.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
