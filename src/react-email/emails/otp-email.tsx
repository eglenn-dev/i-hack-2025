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
                <Preview>Your verification code: {otpCode}</Preview>
                <Body className="bg-[oklch(0.98_0.005_264)] font-sans py-10 px-4">
                    <Container className="bg-white rounded-2xl max-w-[520px] mx-auto border border-[oklch(0.88_0.01_264)]">
                        {/* Header Section */}
                        <Section className="text-center pt-8 pb-4 px-6">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-[oklch(0.45_0.15_264)] rounded-xl mb-4">
                                <Text className="text-[24px] font-bold m-0 text-white">
                                    O
                                </Text>
                            </div>
                            <Heading className="text-[32px] font-bold text-black m-0 mb-2">
                                Verification Code
                            </Heading>
                            <Text className="text-[16px] text-black m-0 leading-6">
                                Enter this code to verify your account
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="px-8 py-10">
                            {/* OTP Code Display */}
                            <div className="text-center mb-8">
                                <Text className="text-[16px] text-black m-0 mb-4">
                                    Your verification code is:
                                </Text>
                                <div className="bg-[oklch(0.95_0.005_264)] border-2 border-solid border-[oklch(0.45_0.15_264)] rounded-xl py-5 px-8 inline-block">
                                    <Text className="text-[40px] font-bold text-black m-0 tracking-[0.3em] font-mono">
                                        {otpCode}
                                    </Text>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="text-center mb-8">
                                <Text className="text-[16px] text-black m-0 mb-2 leading-6">
                                    This code will expire in{" "}
                                    <strong>10 minutes</strong>
                                </Text>
                                <Text className="text-[14px] text-black m-0 leading-5">
                                    If you didn&apos;t request this code, please
                                    ignore this email.
                                </Text>
                            </div>
                        </Section>

                        {/* Footer */}
                        <Section className="bg-[oklch(0.98_0.005_264)] border-t border-solid border-[oklch(0.88_0.01_264)] py-6 px-8 text-center">
                            <Text className="text-[12px] text-black m-0">
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
