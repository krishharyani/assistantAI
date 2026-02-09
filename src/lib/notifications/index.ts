// Notifications placeholder (Twilio SMS, push notifications, etc.)
// TODO: Implement notification channels

export type NotificationChannel = "sms" | "email" | "push";

export interface Notification {
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
}

export async function send(_notification: Notification): Promise<void> {
  // TODO: Route to the correct provider based on channel
  throw new Error("Notifications not yet implemented");
}
