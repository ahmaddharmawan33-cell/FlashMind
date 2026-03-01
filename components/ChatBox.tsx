"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/types";
import { SendIcon, LoaderIcon } from "@/components/Icons";
import { cn } from "@/lib/utils";
import { Brain, Search, Trash2, RotateCcw } from "lucide-react";

const STARTERS = [
  "Jelaskan konsep turunan dengan analogi sederhana",
  "Apa bedanya silogisme deduktif dan induktif?",
  "Apa itu Teori Relativitas Einstein?",
  "Bagaimana cara kerja fotosintesis secara detail?",
];

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlus, setIsPlus] = useState(false);
  const [isResearch, setIsResearch] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history
  useEffect(() => {
    try {
      const saved = localStorage.getItem("flashmind_chat_history");
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) {
      console.error("Gagal load history chat", e);
    }
  }, []);

  // Save history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("flashmind_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const clearChat = () => {
    if (confirm("Hapus semua riwayat percakapan?")) {
      setMessages([]);
      localStorage.removeItem("flashmind_chat_history");
    }
  };

  const send = async (msg?: string) => {
    const text = (msg || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const historyForAPI = [...messages, userMsg];

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyForAPI.slice(-10).map(m => ({ role: m.role, content: m.content })),
          message: text,
          isPlus,
          isResearch
        }),
      });

      if (!response.ok) throw new Error("Gagal menghubungi AI.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamContent = "";

      const assistantMsgPlaceholder: ChatMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsgPlaceholder]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          streamContent += chunk;

          setMessages((prev) => {
            const currentMsgs = [...prev];
            if (currentMsgs.length > 0) {
              currentMsgs[currentMsgs.length - 1] = { role: "assistant", content: streamContent };
            }
            return currentMsgs;
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal terhubung ke AI.");
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 10);
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto h-[calc(100vh-130px)]">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            AI Tutor <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase tracking-tighter font-bold">Plus</span>
          </h2>
          <p className="text-xs text-slate-400">Tanya apa saja seputar materi pelajaran</p>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Hapus Riwayat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Toggles */}
      <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setIsPlus(!isPlus)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border shrink-0",
            isPlus
              ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
              : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
          )}
        >
          <Brain className={cn("w-3 h-3", isPlus && "animate-pulse")} />
          DEEP LEARNING+ {isPlus ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          onClick={() => setIsResearch(!isResearch)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border shrink-0",
            isResearch
              ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
          )}
        >
          <Search className={cn("w-3 h-3", isResearch && "animate-bounce")} />
          RESEARCH MODE {isResearch ? "ON" : "OFF"}
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col gap-4 shadow-inner">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
            <div className="relative">
              <span className="text-6xl select-none animate-bounce">🤖</span>
              <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-[10px] font-bold px-1 rounded">PLUS</div>
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-200">Halo! Aku FlashMind AI Research Companion</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                Aktifkan mode Plus atau Riset untuk pengalaman belajar yang lebih dalam dan interaktif.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {STARTERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="text-left text-xs px-4 py-2.5 rounded-xl border border-slate-800 text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all bg-slate-900/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
          >
            <div
              className={cn(
                "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-800/80 text-slate-200 rounded-bl-sm border border-slate-700/50"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-up">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-800 flex items-center gap-1.5 border border-slate-700/50">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-400 text-center uppercase font-bold tracking-widest">
              ⚠️ {error}
            </p>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="mt-4 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-500 shadow-2xl"></div>
        <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 focus-within:border-indigo-500/50 shadow-2xl overflow-hidden">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Tanyakan riset apa saja... (Enter untuk kirim)"
            className="flex-1 max-h-32 bg-transparent text-slate-100 placeholder-slate-600 text-sm outline-none resize-none px-2 py-2 leading-relaxed"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 shrink-0"
          >
            {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="mt-2 flex justify-between items-center px-1">
        <p className="text-[9px] text-slate-700 font-medium uppercase tracking-widest flex items-center gap-1">
          <RotateCcw className="w-2 h-2" /> History Terjaga Otomatis
        </p>
        <p className="text-[9px] text-slate-800 font-bold tracking-tighter uppercase">By Mawan</p>
      </div>
    </div>
  );
}
