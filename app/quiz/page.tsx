"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import QuizCard from "@/components/QuizCard";
import { Question, QuizDeck } from "@/lib/types";
import { LoaderIcon, QuizIcon } from "@/components/Icons";
import { cn } from "@/lib/utils";
import { Timer, Clock, Trash2, Play, BookOpen, ChevronRight, History, AlertCircle, Brain } from "lucide-react";

type QuizPhase = "setup" | "playing" | "done";

export default function QuizPage() {
  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [materi, setMateri] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"mudah" | "lumayan" | "susah">("susah");
  const [timerDuration, setTimerDuration] = useState(0); // 0 = no timer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [quizDecks, setQuizDecks] = useState<QuizDeck[]>([]);
  const [activeDeckTitle, setActiveDeckTitle] = useState("");

  // Persistence
  useEffect(() => {
    const savedState = localStorage.getItem("flashmind_quiz_state");
    const savedDecks = localStorage.getItem("flashmind_quiz_decks");

    if (savedDecks) {
      try {
        setQuizDecks(JSON.parse(savedDecks));
      } catch (e) {
        console.error("Gagal parse quiz decks", e);
      }
    }

    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setQuestions(state.questions || []);
        setCurrentIdx(state.currentIdx || 0);
        setScore(state.score || { correct: 0, total: 0 });
        setPhase(state.phase || "setup");
        if (state.materi) setMateri(state.materi);
        if (state.timerDuration) setTimerDuration(state.timerDuration);
        if (state.difficulty) setDifficulty(state.difficulty);
        if (state.activeDeckTitle) setActiveDeckTitle(state.activeDeckTitle);
      } catch (e) {
        console.error("Gagal parse quiz state", e);
      }
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("flashmind_quiz_state", JSON.stringify({
        questions,
        currentIdx,
        score,
        phase,
        materi,
        count,
        difficulty,
        timerDuration,
        activeDeckTitle
      }));
      localStorage.setItem("flashmind_quiz_decks", JSON.stringify(quizDecks));
    }
  }, [questions, currentIdx, score, phase, materi, timerDuration, quizDecks, activeDeckTitle, hasLoaded]);

  const handleGenerate = useCallback(async () => {
    if (!materi.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materi: materi.trim(), count, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal generate soal.");

      const newQuestions = data.questions;
      const title = materi.length > 30 ? materi.substring(0, 30) + "..." : materi;

      const newDeck: QuizDeck = {
        id: crypto.randomUUID(),
        title: title,
        createdAt: Date.now(),
        questions: newQuestions,
        stats: { lastScore: 0, totalPlayed: 0 }
      };

      setQuizDecks(prev => [newDeck, ...prev]);
      setQuestions(newQuestions);
      setActiveDeckTitle(title);
      setCurrentIdx(0);
      setScore({ correct: 0, total: 0 });
      setPhase("playing");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal generate soal.");
    }

    setLoading(false);
  }, [materi, count]);

  const handleLoadDeck = (deck: QuizDeck) => {
    setQuestions(deck.questions);
    setActiveDeckTitle(deck.title);
    setCurrentIdx(0);
    setScore({ correct: 0, total: 0 });
    setPhase("playing");
  };

  const handleDeleteDeck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Hapus riwayat kuis ini?")) {
      setQuizDecks(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setPhase("done");
      // Update global stats
      const stats = JSON.parse(localStorage.getItem("flashmind_stats") || '{"decksCreated":0,"cardsReviewed":0,"quizzesTaken":0}');
      stats.quizzesTaken += 1;
      localStorage.setItem("flashmind_stats", JSON.stringify(stats));
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  // Update history stats when finished
  useEffect(() => {
    if (phase === "done" && activeDeckTitle) {
      setQuizDecks(prev => prev.map(d => {
        if (d.title === activeDeckTitle) {
          return {
            ...d,
            stats: {
              lastScore: score.correct,
              totalPlayed: (d.stats?.totalPlayed || 0) + 1
            }
          };
        }
        return d;
      }));
    }
  }, [phase, activeDeckTitle, score.correct]); // Run when phase transitions to 'done'

  const handleReset = () => {
    if (confirm("Keluar dari sesi ini? Progres tidak tersimpan.")) {
      setPhase("setup");
      setQuestions([]);
      setActiveDeckTitle("");
      setCurrentIdx(0);
      setScore({ correct: 0, total: 0 });
      setError("");
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore({ correct: 0, total: 0 });
    setPhase("playing");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      <Sidebar />
      <main className="flex-1 lg:overflow-y-auto p-4 md:p-8 pt-20 lg:pt-8">
        {/* ── Setup ── */}
        {phase === "setup" && (
          <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Creator Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-colors" />

                  <h3 className="font-bold text-xl text-slate-100 mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                      <QuizIcon className="w-5 h-5" />
                    </div>
                    Buat Latihan Baru
                  </h3>
                  <p className="text-sm text-slate-400 mb-8 max-w-md">
                    Tempel materi pelajaranmu — AI akan merancang soal pilihan ganda menantang dengan opsi A-E.
                  </p>

                  <div className="flex flex-col gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Sumber Materi</label>
                      <textarea
                        value={materi}
                        onChange={(e) => setMateri(e.target.value)}
                        placeholder="Contoh: Mekanisme fotosintesis pada tumbuhan C3 dan C4..."
                        rows={6}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-5 py-4 text-sm text-slate-100 placeholder-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none leading-relaxed shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <BookOpen className="w-3 h-3" /> Jumlah Soal
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[5, 10, 20, 25].map((v) => (
                            <button
                              key={v}
                              onClick={() => setCount(v)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                count === v
                                  ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40"
                                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                              )}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Brain className="w-3 h-3" /> Tingkat Kesulitan
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "mudah", label: "Mudah" },
                            { id: "lumayan", label: "Lumayan" },
                            { id: "susah", label: "HOTS" }
                          ].map((d) => (
                            <button
                              key={d.id}
                              onClick={() => setDifficulty(d.id as any)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border",
                                difficulty === d.id
                                  ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40"
                                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                              )}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Timer className="w-3 h-3" /> Waktu per Soal
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[0, 10, 30, 60].map((v) => (
                            <button
                              key={v}
                              onClick={() => setTimerDuration(v)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                timerDuration === v
                                  ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40"
                                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                              )}
                            >
                              {v === 0 ? "Off" : `${v}s`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-3 animate-shake font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                      </div>
                    )}

                    <button
                      onClick={handleGenerate}
                      disabled={!materi.trim() || loading}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] group/btn"
                    >
                      {loading ? (
                        <>
                          <LoaderIcon className="animate-spin" /> MERANCANG SOAL...
                        </>
                      ) : (
                        <>
                          MULAI LATIHAN <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* History Sidebar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <History className="w-3 h-3" /> Riwayat Latihan
                  </h4>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">{quizDecks.length}</span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {quizDecks.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2 opacity-50">
                      <Clock className="w-8 h-8 mx-auto text-slate-700" />
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-tighter">Belum ada riwayat</p>
                    </div>
                  ) : (
                    quizDecks.map((deck) => (
                      <div
                        key={deck.id}
                        onClick={() => handleLoadDeck(deck)}
                        className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group/item relative"
                      >
                        <div className="flex flex-col gap-1 pr-8">
                          <p className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                            {deck.title}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                            <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">{deck.questions.length} Soal</span>
                            <span className="text-indigo-400 font-bold">{deck.stats?.lastScore ?? 0}/{deck.questions.length}</span>
                            <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteDeck(deck.id, e)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 py-8 border-t border-slate-900/50">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 font-medium">Bergabung bersama ribuan siswa lainnya yang berlatih di FlashMind Plus.</p>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Active</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Playing ── */}
        {phase === "playing" && questions.length > 0 && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <QuizCard
              question={questions[currentIdx]}
              questionNumber={currentIdx + 1}
              total={questions.length}
              score={score}
              onAnswer={handleAnswer}
              onNext={handleNext}
              isLast={currentIdx + 1 >= questions.length}
              duration={timerDuration}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={handleReset}
                className="text-[10px] font-black text-slate-600 hover:text-red-400 transition-colors flex items-center gap-2 uppercase tracking-[0.2em]"
              >
                ✕ Hentikan Sesi
              </button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {phase === "done" && (
          <div className="max-w-md mx-auto animate-fade-up">
            <div className="p-10 rounded-[2.5rem] border border-slate-800 bg-slate-900 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

              <div className="relative mb-8 pt-4">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full scale-150 animate-pulse" />
                <div className="text-7xl relative inline-block animate-bounce-slow">
                  {score.correct === score.total ? "👑" : score.correct >= Math.ceil(score.total / 2) ? "⭐" : "📖"}
                </div>
              </div>

              <h3 className="text-3xl font-black text-slate-100 mb-2 tracking-tight">
                MISSION COMPLETE!
              </h3>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-8">
                Skor Akurasi: {Math.round((score.correct / score.total) * 100)}%
              </div>

              <div className="flex items-center justify-center gap-8 mb-10">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Benar</p>
                  <p className="text-4xl font-black text-emerald-400">{score.correct}</p>
                </div>
                <div className="w-px h-12 bg-slate-800" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-4xl font-black text-slate-100">{score.total}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/50 mb-10 text-xs text-slate-400 leading-relaxed font-medium italic shadow-inner">
                {score.correct === score.total
                  ? "Sempurna! Kamu telah menguasai materi ini sepenuhnya. Waktunya tantangan baru!"
                  : score.correct >= Math.ceil(score.total / 2)
                    ? "Sangat Bagus! Sedikit lagi kamu akan mencapai kesempurnaan. Teruslah berlatih."
                    : "Pangkal Pandai! Jangan biarkan kegagalan menghentikanmu. Tinjau kembali materi dan coba lagi."}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRetry}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <Play className="w-4 h-4 fill-white" /> Coba Ulangi
                </button>
                <button
                  onClick={() => setPhase("setup")}
                  className="w-full py-4 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-100 text-xs font-black rounded-2xl transition-all uppercase tracking-widest"
                >
                  Kembali ke Menu
                </button>
              </div>
            </div>
            <p className="text-center mt-12 text-[10px] text-slate-800 font-black tracking-[0.5em] uppercase opacity-30">FlashMind Plus • v1.2</p>
          </div>
        )}
      </main>
    </div>
  );
}
