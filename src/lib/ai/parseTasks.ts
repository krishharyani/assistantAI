import { z } from "zod";
import { getOpenAI, getModel } from "./openai-client";

const parsedTasksSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      dueDate: z.string().nullable(),
    }),
  ),
});

export type ParsedTask = z.infer<typeof parsedTasksSchema>["tasks"][number];

/**
 * Extract tasks from a natural-language text message.
 * Uses gpt-4o-mini for cost efficiency.
 */
export async function parseTasksFromText(
  message: string,
): Promise<ParsedTask[]> {
  const openai = getOpenAI();
  const today = new Date().toISOString().split("T")[0];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a task extraction assistant for students. Given a user message, extract one or more tasks.
Today's date is ${today}.

Return JSON with:
- "tasks": array of objects, each with:
  - "name": short task title (under 60 chars)
  - "description": brief description of what needs to be done
  - "dueDate": deadline in YYYY-MM-DD format, or null if none mentioned

Resolve relative dates (e.g., "by Friday" → the upcoming Friday's date).
If the message describes multiple tasks, extract each one separately.
If the message is vague, do your best to create a reasonable task.`,
      },
      { role: "user", content: message },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '{"tasks":[]}';
  try {
    const parsed = parsedTasksSchema.safeParse(JSON.parse(text));
    if (parsed.success) return parsed.data.tasks;
  } catch {
    /* parse failure → return empty */
  }
  return [];
}

/**
 * Extract tasks from an image (syllabus, assignment sheet, etc.)
 * using OpenAI vision (gpt-4o).
 */
export async function parseTasksFromImage(
  base64Image: string,
  mimeType: string,
): Promise<ParsedTask[]> {
  const openai = getOpenAI();
  const today = new Date().toISOString().split("T")[0];

  const response = await openai.chat.completions.create({
    model: getModel(),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a task extraction assistant for students. The user will provide an image of a syllabus, assignment, schedule, or similar document.
Today's date is ${today}.

Extract ALL tasks, assignments, homework, deadlines, and due dates visible in the image.

Return JSON with:
- "tasks": array of objects, each with:
  - "name": short task title
  - "description": what needs to be done
  - "dueDate": deadline in YYYY-MM-DD format, or null if not visible

If you cannot read the image clearly, return an empty tasks array.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
          {
            type: "text",
            text: "Extract all tasks and deadlines from this image.",
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '{"tasks":[]}';
  try {
    const parsed = parsedTasksSchema.safeParse(JSON.parse(text));
    if (parsed.success) return parsed.data.tasks;
  } catch {
    /* parse failure → return empty */
  }
  return [];
}
