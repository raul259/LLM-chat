// app/api/llm/route.ts
import { openai } from "@/lib/openai";

type ChatMsg = { role: "user" | "assistant" | "developer"; content: string };

// Rate limiting simple (en producción usar mejor solución como Vercel KV)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: Request): string {
  return req.headers.get("x-forwarded-for") || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + 60000 }); // 1 minuto
    return false;
  }
  
  if (record.count >= 10) { // Máximo 10 requests por minuto
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req);
  if (isRateLimited(rateLimitKey)) {
    return new Response("Too many requests. Please try again later.", { status: 429 });
  }

  const { messages, model } = (await req.json()) as {
    messages: ChatMsg[];
    model?: string;
  };

  // Validación de input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response("Invalid messages", { status: 400 });
  }

  // Limitar longitud de mensajes
  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_MESSAGES = 20;
  
  if (messages.length > MAX_MESSAGES) {
    return new Response("Too many messages", { status: 400 });
  }

  for (const msg of messages) {
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return new Response("Message too long", { status: 400 });
    }
  }

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