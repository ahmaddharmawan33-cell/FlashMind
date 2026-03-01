"use client";

import { useState, useEffect, useRef } from "react";
import { cn, OPTION_LETTERS } from "@/lib/utils";
import { Question } from "@/lib/types";
import { Timer, AlertCircle } from "lucide-react";

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  total: number;
  score: { correct: number; total: number };
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
  duration?: number; // seconds per question
}

export default function QuizCard({
  question,
  questionNumber,
  total,
  score,
  onAnswer,
  onNext,
  isLast,
  duration = 0,
}: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (duration > 0 && selected === null) {
      setTimeLeft(duration);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleAutoSkip();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.id, duration, selected]);

  const handleAutoSkip = () => {
    if (selected !== null) return;
    setSelected(-1); // Mark as skipped/wrong
    onAnswer(false);
  };

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(i);
    onAnswer(i === question.jawaban);
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplain(false);
    onNext();
  };

  const isLowTime = duration > 0 && timeLeft <= 5;

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            Latihan Soal
            {duration > 0 && (
              <span className={cn(
                "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold transition-colors",
                isLowTime ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" : "bg-slate-800 border-slate-700 text-slate-400"
              )}>
                <Timer className="w-3 h-3" />
                {timeLeft}s
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400">
            Soal {questionNumber} dari {total} ·{" "}
            <span className="text-emerald-400">{score.correct} benar</span>
          </p>
        </div>
      </div>

      {/* Progress & Timer Bar combined */}
      <div className="space-y-1.5">
        <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${((questionNumber - 1) / total) * 100}%` }}
          />
        </div>
        {duration > 0 && selected === null && (
          <div className="h-0.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000 linear",
                isLowTime ? "bg-red-500" : "bg-emerald-500/50"
              )}
              style={{ width: `${(timeLeft / duration) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Auto-skip alert */}
      {selected === -1 && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest animate-shake">
          <AlertCircle className="w-4 h-4" />
          Waktu Habis! Soal dilewati otomatis.
        </div>
      )}

      {/* Question */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <p className="text-base leading-relaxed font-medium text-slate-100">
          {question.soal}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.opsi.map((opt, i) => {
          let cls =
            "border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-slate-100 cursor-pointer";

          if (selected !== null) {
            if (i === question.jawaban) {
              cls = "border-emerald-600 bg-emerald-900/20 text-emerald-300 cursor-default";
            } else if (i === selected) {
              cls = "border-red-600 bg-red-900/20 text-red-300 cursor-default";
            } else {
              cls = "border-slate-800 text-slate-600 cursor-default";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={cn(
                "w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all relative overflow-hidden group",
                cls
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 text-[10px] font-bold border border-slate-700 group-hover:border-indigo-500 transition-colors">
                  {OPTION_LETTERS[i]}
                </span>
                <span className="flex-1">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* After answer */}
      {selected !== null && (
        <div className="flex flex-col gap-3 animate-fade-up">
          <button
            onClick={() => setShowExplain((s) => !s)}
            className="self-start text-xs px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-all font-bold uppercase tracking-tighter"
          >
            {showExplain ? "Tutup Pembahasan" : "Lihat Pembahasan"}
          </button>

          {showExplain && question.pembahasan && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 text-sm leading-relaxed text-slate-300 animate-fade-up shadow-inner">
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0">💡 Analisis:</span>
                <span>{question.pembahasan}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            className="self-end px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {isLast ? "Lihat Hasil Akhir →" : "Soal Berikutnya →"}
          </button>
        </div>
      )}
    </div>
  );
}
