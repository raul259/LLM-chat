"use client";

import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Trash2, Square, Send, Sparkles } from "lucide-react";

type UIMessage = {
  id: string;
  role: "user" | "assistant" | "developer";
  content: string;
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2);
}

export default function LLMChat() {
  const [model] = React.useState("gpt-4o-mini");
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<UIMessage[]>([
    {
      id: uid(),
      role: "developer",
      content:
        "Eres un asistente útil. Responde claro y directo. Si falta contexto, pregunta primero.",
    },
  ]);
  const [isStreaming, setIsStreaming] = React.useState(false);

  const abortRef = React.useRef<AbortController | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, isStreaming]);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  function clearChat() {
    if (isStreaming) return;
    setMessages((prev) => prev.filter((m) => m.role === "developer"));
    setInput("");
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: UIMessage = { id: uid(), role: "user", content: trimmed };
    const assistantMsg: UIMessage = { id: uid(), role: "assistant", content: "" };

    setInput("");
    setIsStreaming(true);
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // manda SOLO últimas N para no crecer infinito
      const snapshot = [...messages, userMsg].slice(-12).map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({ model, messages: snapshot }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Request failed");
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + value } : m))
        );
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Ups… falló la respuesta. Revisa la ruta /api/llm y tu API key." }
              : m
          )
        );
      }
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  }

  const quickPrompts = [
    "Explícame este error y cómo arreglarlo",
    "Optimiza este componente y hazlo más limpio",
    "Dame ejemplos de uso y edge cases",
  ];

  const visible = messages.filter((m) => m.role !== "developer");
  const lastAssistant = [...visible].reverse().find((m) => m.role === "assistant");

  return (
    <Card className="w-full rounded-2xl border border-slate-700/50 bg-slate-900/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <CardHeader className="space-y-3 bg-linear-to-r from-slate-800 via-slate-800 to-slate-900 border-b border-slate-700/50 rounded-t-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-100">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Chat Assistant
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 border-slate-600 font-mono text-xs">{model}</Badge>
              {isStreaming ? (
                <Badge className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/50 animate-pulse font-medium text-xs">● Generando</Badge>
              ) : (
                <Badge className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/50 font-medium text-xs">● Online</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!lastAssistant?.content}
              onClick={() => copyToClipboard(lastAssistant?.content ?? "")}
              title="Copiar última respuesta"
              className="rounded-lg bg-slate-700/50 hover:bg-slate-600 border-slate-600 text-slate-300 hover:text-white transition-all"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              disabled={isStreaming}
              onClick={clearChat}
              title="Limpiar chat"
              className="rounded-lg bg-slate-700/50 hover:bg-slate-600 border-slate-600 text-slate-300 hover:text-white transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              disabled={!isStreaming}
              onClick={stop}
              title="Stop"
              className="rounded-lg bg-red-500/20 hover:bg-red-500 border-red-500/50 text-red-400 hover:text-white transition-all"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700/50" />

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p) => (
            <Button
              key={p}
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 hover:text-white text-xs transition-all"
              onClick={() => setInput(p)}
              disabled={isStreaming}
            >
              {p}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pb-0 pt-4">
        <ScrollArea className="h-[460px] rounded-xl border border-slate-700/50 bg-slate-950/50">
          <div className="space-y-4 p-5">
            {visible.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4">
                  <Sparkles className="h-8 w-8 text-cyan-400" />
                </div>
                <div className="text-sm text-slate-400 font-light">
                  Inicia una conversación
                </div>
              </div>
            ) : (
              visible.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed backdrop-blur-sm",
                    m.role === "user"
                      ? "ml-auto bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      : "mr-auto bg-slate-800/80 border border-slate-700/50 text-slate-100 shadow-lg",
                  ].join(" ")}
                >
                  {m.content || (m.role === "assistant" && isStreaming ? <span className="text-slate-400">●●●</span> : "")}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="gap-3 pt-4 border-t border-slate-700/50">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje... (Enter: enviar | Shift+Enter: nueva línea)"
          className="min-h-14 resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          disabled={isStreaming}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />

        <Button 
          onClick={send} 
          disabled={!input.trim() || isStreaming} 
          className="rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 px-6"
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </CardFooter>
    </Card>
  );
}