// app/api/llm/route.ts
import { openai } from "@/lib/openai";

type ChatMsg = { role: "user" | "assistant" | "developer"; content: string };

export async function POST(req: Request) {
  const { messages, model } = (await req.json()) as {
    messages: ChatMsg[];
    model?: string;
  };

  const stream = await openai.responses.create({
    model: model ?? "gpt-4o-mini",
    stream: true,
    input: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const body = new ReadableStream<string>({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") controller.enqueue(event.delta ?? "");
        if (event.type === "response.completed") break;
      }
      controller.close();
    },
  }).pipeThrough(new TextEncoderStream());

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}