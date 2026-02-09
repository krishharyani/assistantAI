// Labeling rules and category mappings
// Define how classified emails map to Gmail labels and internal categories.

export interface LabelRule {
  /** AI classification category this rule matches */
  category: string;
  /** Gmail label to apply */
  gmailLabel: string;
  /** Whether to auto-archive (remove from INBOX) */
  archive: boolean;
  /** Priority for ordering when multiple rules match */
  priority: number;
}

// TODO: Move to DB/config once settings UI exists
export const DEFAULT_RULES: LabelRule[] = [
  {
    category: "booking_request",
    gmailLabel: "AutoLabel/Bookings",
    archive: false,
    priority: 1,
  },
  {
    category: "newsletter",
    gmailLabel: "AutoLabel/Newsletters",
    archive: true,
    priority: 10,
  },
  {
    category: "receipt",
    gmailLabel: "AutoLabel/Receipts",
    archive: true,
    priority: 10,
  },
  {
    category: "spam",
    gmailLabel: "AutoLabel/Spam",
    archive: true,
    priority: 20,
  },
];

export function findMatchingRules(category: string): LabelRule[] {
  return DEFAULT_RULES.filter((r) => r.category === category).sort(
    (a, b) => a.priority - b.priority,
  );
}
