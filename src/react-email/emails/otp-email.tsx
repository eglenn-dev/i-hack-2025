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
            <Tailwind>
                <Body className="bg-gray-100 font-sans py-10">
                    <Container className="bg-white rounded-xl shadow-lg max-w-[600px] mx-auto p-10">
                        {/* Header */}
                        <Section className="text-center mb-8">
                            <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-4">
                                Verification Code
                            </Heading>
                            <Text className="text-4 text-gray-600 m-0">
                                Use this code to complete your verification
                            </Text>
                        </Section>

                        {/* OTP Code Display */}
                        <Section className="text-center mb-8">
                            <div className="bg-gray-50 border-2 border-solid border-gray-200 rounded-[12px] p-6 inline-block">
                                <Text className="text-[36px] font-bold text-gray-900 m-0 tracking-2 font-mono">
                                    {otpCode}
                                </Text>
                            </div>
                        </Section>

                        {/* Footer */}
                        <Section className="border-t border-solid border-gray-200 pt-6 text-center">
                            <Text className="text-[12px] text-gray-400 m-0">
                                &copy; {new Date().getFullYear()}{" "}
                                <Link href="https://olin.help">Olin.help</Link>.
                                All rights reserved.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
