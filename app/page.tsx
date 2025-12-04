"use client"

import LLMChat from "@/components/llmchat";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
            LLM Chat Pro
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-light">
            Asistente inteligente de última generación
          </p>
        </div>
        <LLMChat />
      </div>
    </div>
  );
}