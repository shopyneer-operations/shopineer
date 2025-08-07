import { Button, Link, Section, Text, Img, Hr } from "@react-email/components";
import { Base } from "./base";

/**
 * The key for the PasswordResetEmail template, used to identify it
 */
export const PASSWORD_RESET = "password-reset";

/**
 * The props for the PasswordResetEmail template
 */
export interface PasswordResetEmailProps {
  /**
   * The URL that the user can click to reset their password
   */
  reset_url: string;
  /**
   * The user's email address
   */
  email?: string;
  /**
   * The preview text for the email, appears next to the subject
   * in mail providers like Gmail
   */
  preview?: string;
}

/**
 * Type guard for checking if the data is of type PasswordResetEmailProps
 * @param data - The data to check
 */
export const isPasswordResetData = (data: any): data is PasswordResetEmailProps =>
  typeof data.reset_url === "string" &&
  (typeof data.email === "string" || !data.email) &&
  (typeof data.preview === "string" || !data.preview);

/**
 * The PasswordResetEmail template component built with react-email
 */
export const PasswordResetEmail = ({ reset_url, email, preview = "Reset your password" }: PasswordResetEmailProps) => {
  return (
    <Base preview={preview}>
      <Section className="mt-[32px]">
        <Img
          src="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg"
          alt="Medusa"
          className="mx-auto w-28"
        />
      </Section>
      <Section className="text-center">
        <Text className="text-black text-[14px] leading-[24px]">Hello{email ? ` ${email}` : ""},</Text>
        <Text className="text-black text-[14px] leading-[24px]">
          We received a request to reset your password. Click the button below to create a new password for your
          account.
        </Text>
        <Section className="mt-4 mb-[32px]">
          <Button
            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline px-5 py-3"
            href={reset_url}
          >
            Reset Password
          </Button>
        </Section>
        <Text className="text-black text-[14px] leading-[24px]">Or copy and paste this URL into your browser:</Text>
        <Text
          style={{
            maxWidth: "100%",
            wordBreak: "break-all",
            overflowWrap: "break-word",
          }}
        >
          <Link href={reset_url} className="text-blue-600 no-underline">
            {reset_url}
          </Link>
        </Text>
      </Section>
      <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
      <Text className="text-[#666666] text-[12px] leading-[24px]">
        This password reset link will expire soon for security reasons.
      </Text>
      <Text className="text-[#666666] text-[12px] leading-[24px] mt-2">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </Text>
      <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
      <Text className="text-[#666666] text-[12px] leading-[24px]">
        For security reasons, never share this reset link with anyone. If you're having trouble with the button above,
        copy and paste the URL into your web browser.
      </Text>
    </Base>
  );
};

PasswordResetEmail.PreviewProps = {
  reset_url: "https://mywebsite.com/reset-password?token=sample-reset-token-123&email=user@example.com",
  email: "user@example.com",
} as PasswordResetEmailProps;

export default PasswordResetEmail;
