"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import FlipCard from "@/components/FlipCard";
import { Deck, Flashcard, LeitnerBox } from "@/lib/types";
import { cn, LEITNER_BOXES, generateId } from "@/lib/utils";
import { PlusIcon, TrashIcon, FlashIcon, LoaderIcon } from "@/components/Icons";

// ─── Deck list view ───────────────────────────────────────────────────────────
function DeckList({
  decks,
  onStartStudy,
  onDeleteDeck,
  onGenerate,
}: {
  decks: Deck[];
  onStartStudy: (deck: Deck) => void;
  onDeleteDeck: (id: string) => void;
  onGenerate: (materi: string, title: string, count: number, difficulty: string) => Promise<void>;
}) {
  const [materi, setMateri] = useState("");
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("lumayan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!materi.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onGenerate(materi.trim(), title.trim(), count, difficulty);
      setMateri("");
      setTitle("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal generate flashcard.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Generate form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <h3 className="font-semibold text-slate-100 mb-1">Buat Flashcard dari Materi</h3>
        <p className="text-sm text-slate-400 mb-5">
          Tempel materi pelajaranmu — AI akan membuat kartu pertanyaan & jawaban untukmu secara otomatis.
        </p>

        <div className="flex flex-col gap-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nama deck (opsional, misal: Biologi Bab 3)"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
          />
          <textarea
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            placeholder="Tempel materi di sini... bisa catatan pelajaran, ringkasan bab, atau paragraf dari buku."
            rows={6}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
          />

          {/* New Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Jumlah Kartu</label>
              <div className="flex gap-2">
                {[10, 20, 25].map((v) => (
                  <button
                    key={v}
                    onClick={() => setCount(v)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold transition-all border",
                      count === v
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tingkat Kesulitan</label>
              <div className="flex gap-2">
                {[
                  { id: "mudah", label: "Mudah" },
                  { id: "lumayan", label: "Lumayan" },
                  { id: "susah", label: "HOTS" }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border",
                      difficulty === d.id
                        ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/20"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!materi.trim() || loading}
            className="self-start inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <LoaderIcon /> Membuat {count} flashcard...
              </>
            ) : (
              <>
                <PlusIcon /> Generate Flashcard
              </>
            )}
          </button>
        </div>
      </div>

      {/* Deck list */}
      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
          <span className="text-4xl select-none">🃏</span>
          <p className="text-sm font-medium text-slate-500">Belum ada deck</p>
          <p className="text-xs text-slate-600">Masukkan materi di atas untuk memulai</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-slate-100">
            Deck kamu ({decks.length})
          </h3>

          {decks.map((deck) => {
            const mastered = deck.cards.filter((c) => c.box === 3).length;
            const todo = deck.cards.filter((c) => c.box < 3).length;

            return (
              <div
                key={deck.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900 group/card relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 truncate group-hover/card:text-indigo-400 transition-colors">
                      {deck.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] sm:text-xs">
                      <span className="text-slate-500">
                        {deck.cards.length} kartu
                      </span>
                      <span className="text-emerald-400 font-medium">{mastered} hafal</span>
                      {todo > 0 && (
                        <span className="text-amber-400 font-medium">{todo} perlu latihan</span>
                      )}
                    </div>

                    {/* Leitner dots */}
                    <div className="flex gap-0.5 mt-3 flex-wrap">
                      {deck.cards.map((c) => (
                        <div
                          key={c.id}
                          title={LEITNER_BOXES[c.box].label}
                          className={cn(
                            "h-1 w-2.5 sm:h-1.5 sm:w-3 rounded-full transition-colors",
                            LEITNER_BOXES[c.box].dotColor
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    <button
                      onClick={() => onStartStudy(deck)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/10"
                    >
                      <FlashIcon className="w-3.5 h-3.5" /> Belajar
                    </button>
                    <button
                      onClick={() => onDeleteDeck(deck.id)}
                      className="p-2 rounded-xl border border-slate-800 text-slate-600 hover:text-red-400 hover:border-red-400/30 transition-all active:scale-95"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leitner legend */}
      {decks.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-800 text-xs">
          <p className="font-medium text-slate-300 mb-2">
            Sistem Leitner — Spaced Repetition
          </p>
          <p className="text-slate-500 mb-3 leading-relaxed">
            Jawab benar → kartu naik ke kotak berikutnya. Jawab salah → kembali
            ke Kotak 1. Kartu di kotak lebih tinggi diulang lebih jarang.
          </p>
          <div className="flex flex-wrap gap-2">
            {LEITNER_BOXES.map((b, i) => (
              <span
                key={i}
                className={cn(
                  "px-2 py-1 rounded-lg border text-xs",
                  b.textColor,
                  b.bgColor,
                  b.borderColor
                )}
              >
                {b.label} · {b.sub}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FlashcardPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [studyState, setStudyState] = useState<{
    deck: Deck;
    pool: Flashcard[];
    idx: number;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("flashmind_decks");
    if (saved) setDecks(JSON.parse(saved));
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("flashmind_decks", JSON.stringify(decks));
      // Update lifetime stats
      const stats = JSON.parse(localStorage.getItem("flashmind_stats") || '{"decksCreated":0,"cardsReviewed":0,"quizzesTaken":0}');
      stats.decksCreated = decks.length;
      localStorage.setItem("flashmind_stats", JSON.stringify(stats));
    }
  }, [decks, hasLoaded]);

  const handleGenerate = useCallback(async (materi: string, titleInput: string, count: number, difficulty: string) => {
    const res = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materi, count, difficulty }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Gagal generate.");

    const cards: Flashcard[] = (data.cards as Array<{ front: string; back: string }>).map(
      (c) => ({
        id: generateId(),
        front: c.front,
        back: c.back,
        box: 0 as LeitnerBox,
        lastReviewed: Date.now(),
      })
    );

    const deck: Deck = {
      id: generateId(),
      title: titleInput || `Deck ${decks.length + 1}`,
      createdAt: Date.now(),
      cards,
    };

    setDecks((prev) => [...prev, deck]);
  }, [decks.length]);

  const handleStartStudy = (deck: Deck) => {
    const todo = deck.cards.filter((c) => c.box < 3);
    const pool = (todo.length > 0 ? todo : deck.cards)
      .slice()
      .sort(() => Math.random() - 0.5);
    setStudyState({ deck, pool, idx: 0 });
  };

  const handleGrade = (knew: boolean) => {
    if (!studyState) return;
    const { deck, pool, idx } = studyState;
    const card = pool[idx];
    const newBox = (knew ? Math.min(card.box + 1, 3) : 0) as LeitnerBox;

    const updatedDecks = decks.map((d) =>
      d.id === deck.id
        ? {
          ...d,
          cards: d.cards.map((c) =>
            c.id === card.id ? { ...c, box: newBox, lastReviewed: Date.now() } : c
          ),
        }
        : d
    );
    setDecks(updatedDecks);

    // Update lifetime review stats
    const stats = JSON.parse(localStorage.getItem("flashmind_stats") || '{"decksCreated":0,"cardsReviewed":0,"quizzesTaken":0}');
    stats.cardsReviewed += 1;
    localStorage.setItem("flashmind_stats", JSON.stringify(stats));

    if (idx + 1 >= pool.length) {
      setStudyState(null);
    } else {
      const updatedDeck = updatedDecks.find((d) => d.id === deck.id)!;
      const updatedPool = pool.map((c: Flashcard, i: number) =>
        i === idx ? { ...c, box: newBox, lastReviewed: Date.now() } : c
      );
      setStudyState({ deck: updatedDeck, pool: updatedPool, idx: idx + 1 });
    }
  };

  const handleFinish = () => setStudyState(null);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      <Sidebar />
      <main className="flex-1 lg:overflow-y-auto p-4 md:p-8 pt-20 lg:pt-8">
        {studyState ? (
          <FlipCard
            card={studyState.pool[studyState.idx]}
            cardNumber={studyState.idx + 1}
            total={studyState.pool.length}
            onGrade={handleGrade}
            onFinish={handleFinish}
          />
        ) : (
          <DeckList
            decks={decks}
            onStartStudy={handleStartStudy}
            onDeleteDeck={(id) => setDecks((prev) => prev.filter((d) => d.id !== id))}
            onGenerate={handleGenerate}
          />
        )}
      </main>
    </div>
  );
}
