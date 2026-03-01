"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Flashcard } from "@/lib/types";
import { LEITNER_BOXES } from "@/lib/utils";
import { EyeIcon, CheckIcon, XIcon } from "@/components/Icons";

interface FlipCardProps {
  card: Flashcard;
  cardNumber: number;
  total: number;
  onGrade: (knew: boolean) => void;
  onFinish: () => void;
}

export default function FlipCard({
  card,
  cardNumber,
  total,
  onGrade,
  onFinish,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const box = LEITNER_BOXES[card.box];

  const handleFlip = () => setFlipped((f) => !f);

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Kartu{" "}
            <span className="text-slate-200 font-semibold">{cardNumber}</span>{" "}
            dari{" "}
            <span className="text-slate-200 font-semibold">{total}</span>
          </p>
        </div>
        <button
          onClick={onFinish}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors"
        >
          Selesai
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${((cardNumber - 1) / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="flip-scene" style={{ minHeight: 280 }}>
        <div
          className={cn("flip-card w-full", flipped && "is-flipped")}
          style={{ minHeight: 280 }}
          onClick={handleFlip}
        >
          {/* Front */}
          <div className="flip-card__face flip-card__face--front w-full flex flex-col items-center justify-center gap-5 p-8 rounded-2xl border border-slate-800 bg-slate-900 cursor-pointer hover:border-slate-700 transition-colors">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Pertanyaan
            </p>
            <p className="text-xl text-center font-medium leading-relaxed text-slate-100">
              {card.front}
            </p>
            <p className="text-xs text-slate-600 select-none">
              Klik kartu untuk lihat jawaban
            </p>
          </div>

          {/* Back */}
          <div className="flip-card__face flip-card__face--back w-full flex flex-col items-center justify-center gap-5 p-8 rounded-2xl border border-indigo-800/40 bg-indigo-950/50 cursor-pointer">
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
              Jawaban
            </p>
            <p className="text-lg text-center leading-relaxed text-slate-100">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!flipped ? (
        <button
          onClick={handleFlip}
          className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <EyeIcon /> Lihat Jawaban
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setFlipped(false); onGrade(false); }}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-800/60 text-red-400 hover:bg-red-900/20 transition-colors text-sm font-medium"
          >
            <XIcon /> Belum Hafal
          </button>
          <button
            onClick={() => { setFlipped(false); onGrade(true); }}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-emerald-700/60 text-emerald-400 hover:bg-emerald-900/20 transition-colors text-sm font-medium"
          >
            <CheckIcon /> Sudah Hafal
          </button>
        </div>
      )}

      {/* Leitner badge */}
      <div className="flex justify-center">
        <span
          className={cn(
            "text-xs px-3 py-1 rounded-lg border",
            box.textColor,
            box.bgColor,
            box.borderColor
          )}
        >
          {box.label} · {box.sub}
        </span>
      </div>
    </div>
  );
}
