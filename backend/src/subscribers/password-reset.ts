import { INotificationModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { EmailTemplates } from "../modules/email-notifications/templates";
import { STORE_URL } from "../lib/constants";

export default async function resetPasswordTokenHandler({
  event: {
    data: { entity_id: email, token, actor_type },
  },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);
  const config = container.resolve("configModule");

  let urlPrefix = "";

  if (actor_type === "customer") {
    urlPrefix = config.admin.storefrontUrl || STORE_URL;
  } else {
    const backendUrl = config.admin.backendUrl !== "/" ? config.admin.backendUrl : "http://localhost:9000";
    const adminPath = config.admin.path;
    urlPrefix = `${backendUrl}${adminPath}`;
  }

  try {
    await notificationModuleService.createNotifications({
      to: email,
      channel: "email",
      template: EmailTemplates.PASSWORD_RESET,
      data: {
        reset_url: `${urlPrefix}/reset-password?token=${token}&email=${email}`,
        email: email,
        preview: "Reset your password",
      },
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
