import { Container } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { INotificationModuleService } from "@medusajs/framework/types";
import { EmailTemplates } from "../modules/email-notifications/templates";

/**
 * Test script to verify password reset email functionality
 * Run with: npx tsx src/scripts/test-password-reset.ts
 */
async function testPasswordReset() {
  console.log("🧪 Testing password reset email functionality...");

  try {
    // Create a container instance
    const container = new Container();

    // Resolve the notification service
    const notificationService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);

    // Test data
    const testData = {
      reset_url: "https://your-storefront.com/reset-password?token=test-token-123&email=test@example.com",
      email: "test@example.com",
      preview: "Reset your password",
    };

    console.log("📧 Sending test password reset email...");
    console.log("📋 Test data:", testData);

    // Send the test notification
    await notificationService.createNotifications({
      to: "test@example.com",
      channel: "email",
      template: EmailTemplates.PASSWORD_RESET,
      data: testData,
    });

    console.log("✅ Password reset email sent successfully!");
    console.log("📬 Check your email inbox or Resend dashboard for the test email");
  } catch (error) {
    console.error("❌ Error testing password reset email:", error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPasswordReset()
    .then(() => {
      console.log("🎉 Test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Test failed:", error);
      process.exit(1);
    });
}

export { testPasswordReset };
