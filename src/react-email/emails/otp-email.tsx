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
} from "@react-email/components";

interface OtpEmailProps {
    otpCode: string;
}

export default function OtpEmail({ otpCode = "123123" }: OtpEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head />
            <Preview>Your verification code: {otpCode}</Preview>
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
                        {/* Header with Brand Color */}
                        <Section className="text-center mb-8">
                            <div className="inline-block bg-blue-600 rounded-lg p-3 mb-4">
                                <Text className="text-[24px] m-0 text-white">
                                    Olin
                                </Text>
                            </div>
                            <Heading className="text-[28px] font-bold text-[oklch(0.2_0.02_264)] m-0 mb-4">
                                Verification Code
                            </Heading>
                            <Text className="text-[14px] text-[oklch(0.5_0.01_264)] m-0">
                                Use this code to complete your verification
                            </Text>
                        </Section>

                        {/* OTP Code Display with Primary Theme */}
                        <Section className="text-center mb-8">
                            <div className="bg-[oklch(0.95_0.005_264)] border-2 border-solid border-[oklch(0.45_0.15_264)] rounded-xl p-6 inline-block">
                                <Text className="text-[36px] font-bold text-[oklch(0.2_0.02_264)] m-0 tracking-[0.2em] font-mono">
                                    {otpCode}
                                </Text>
                            </div>
                        </Section>

                        {/* Security Notice */}
                        <Section className="mb-8">
                            <div className="bg-[oklch(0.95_0.005_264)] rounded-lg p-4 border border-[oklch(0.88_0.01_264)]">
                                <Text className="text-[12px] text-[oklch(0.5_0.01_264)] m-0">
                                    🔒 This code will expire in 10 minutes.
                                    Never share this code with anyone.
                                </Text>
                            </div>
                        </Section>

                        {/* Footer */}
                        <Section className="border-t border-solid border-[oklch(0.88_0.01_264)] pt-6 text-center">
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
