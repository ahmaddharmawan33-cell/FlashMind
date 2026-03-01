import { NextRequest, NextResponse } from "next/server";
import { generateFlashcards } from "@/lib/ai";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { materi, count, difficulty } = body as {
      materi: string;
      count?: number;
      difficulty?: "mudah" | "lumayan" | "susah"
    };

    if (!materi || typeof materi !== "string" || materi.trim().length < 10) {
      return NextResponse.json(
        { error: "Materi harus diisi minimal 10 karakter." },
        { status: 400 }
      );
    }

    const cards = await generateFlashcards(
      materi.trim(),
      count || 10,
      difficulty || "lumayan"
    );

    return NextResponse.json({ cards }, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/flashcards] Error:", err);

    const message =
      err instanceof Error ? err.message : "Gagal generate flashcard.";

    return NextResponse.json(
      { error: `DIAGNOSIS: ${message}` },
      { status: 500 }
    );
  }
}
