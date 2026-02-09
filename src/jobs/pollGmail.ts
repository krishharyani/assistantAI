// Gmail polling job
// Fetches new emails, classifies them, applies labels, and extracts bookings.

import type { Job } from "./runner";
import { listMessages } from "@/lib/google/gmail";
import { logger } from "@/lib/logging/logger";

export const pollGmailJob: Job = {
  name: "poll-gmail",

  async execute(): Promise<string> {
    // TODO: Iterate over all users with valid Google tokens
    // TODO: For each user:
    //   1. Fetch unprocessed messages (listMessages with a query filter)
    //   2. Normalize each message
    //   3. Classify via AI
    //   4. Apply label rules
    //   5. If booking_request → extract booking → create calendar event
    //   6. Mark as processed in DB
    //   7. Write audit log

    logger.info("Gmail poll started");

    // Placeholder: no users wired up yet
    const messages = await listMessages("", { maxResults: 10 });

    logger.info("Gmail poll complete", { count: messages.length });
    return `Processed ${messages.length} messages`;
  },
};
