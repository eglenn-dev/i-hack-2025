import * as React from "react";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
    Link,
    Button,
} from "@react-email/components";

interface WelcomeEmailProps {
    userName: string;
    email: string;
}

export default function WelcomeEmail({
    userName = "John",
    email = "john@example.com",
}: WelcomeEmailProps) {
    return (
        <Html lang="en" dir="ltr">
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
                        },
                    },
                }}
            >
                <Head />
                <Preview>
                    Welcome to Olin - Your AI Interview Coach is Ready!
                </Preview>
                <Body className="bg-[oklch(0.98_0.005_264)] font-sans py-10 px-4">
                    <Container className="bg-white rounded-2xl max-w-[520px] mx-auto border border-[oklch(0.88_0.01_264)]">
                        {/* Header Section */}
                        <Section className="text-center py-8 px-6">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
                                <Text className="text-[24px] font-bold m-0 text-white">
                                    O
                                </Text>
                            </div>
                            <Heading className="text-[32px] font-bold text-black m-0 mb-2">
                                Welcome to Olin!
                            </Heading>
                            <Text className="text-[16px] text-black m-0 leading-6">
                                Your AI interview coach is ready to help you
                                succeed
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="px-8 py-10">
                            {/* Personal Greeting */}
                            <div className="mb-8">
                                <Text className="text-[18px] text-black m-0 mb-4 leading-[26px]">
                                    Hi <strong>{userName}</strong>,
                                </Text>
                                <Text className="text-[16px] text-black m-0 mb-4 leading-6">
                                    Welcome to Olin! We&apos;re excited to help
                                    you ace your next interview with the power
                                    of AI-driven practice and feedback.
                                </Text>
                                <Text className="text-[16px] text-black m-0 leading-6">
                                    Your account has been successfully created
                                    for <strong>{email}</strong>
                                </Text>
                            </div>

                            {/* Get Started Button */}
                            <div className="text-center mb-8">
                                <Button
                                    href="https://olin.help/dashboard"
                                    className="bg-blue-600 text-white px-8 py-4 rounded-xl text-[16px] font-semibold no-underline inline-block box-border"
                                >
                                    Start Your First Interview
                                </Button>
                            </div>

                            {/* Features List */}
                            <div className="mb-8">
                                <Text className="text-[18px] font-bold text-black m-0 mb-4">
                                    What you can do with Olin:
                                </Text>
                                <div className="space-y-3">
                                    <Text className="text-[16px] text-black m-0 leading-6">
                                        <strong>AI-Powered Interviews:</strong>{" "}
                                        Practice with our intelligent
                                        interviewer that adapts to your
                                        responses
                                    </Text>
                                    <Text className="text-[16px] text-black m-0 leading-6">
                                        <strong>Real-Time Feedback:</strong> Get
                                        instant insights on your performance and
                                        areas for improvement
                                    </Text>
                                    <Text className="text-[16px] text-black m-0 leading-6">
                                        <strong>
                                            Industry-Specific Questions:
                                        </strong>{" "}
                                        Practice with questions tailored to your
                                        field and role
                                    </Text>
                                </div>
                            </div>
                        </Section>

                        {/* Footer */}
                        <Section className="bg-[oklch(0.98_0.005_264)] border-t border-solid border-[oklch(0.88_0.01_264)] py-6 px-8 text-center">
                            <Text className="text-[14px] text-black m-0 mb-2">
                                Questions? We&apos;re here to help! Contact our{" "}
                                <Link
                                    href="https://olin.help/support"
                                    className="text-blue-600 no-underline"
                                >
                                    support team
                                </Link>
                            </Text>
                            <Text className="text-[12px] text-black m-0">
                                &copy; {new Date().getFullYear()}{" "}
                                <Link
                                    href="https://olin.help"
                                    className="text-blue-600 no-underline"
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

WelcomeEmail.PreviewProps = {
    userName: "John",
    email: "john@example.com",
};
