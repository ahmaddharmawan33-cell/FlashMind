import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/ai";
import { generateId } from "@/lib/utils";
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

    const rawQuestions = await generateQuestions(
      materi.trim(),
      count || 5,
      difficulty || "susah"
    );

    // Attach IDs
    const questions = rawQuestions.map((q) => ({
      ...q,
      id: generateId(),
    }));

    return NextResponse.json({ questions }, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/questions] Error:", err);

    const message =
      err instanceof Error ? err.message : "Gagal generate soal.";

    return NextResponse.json(
      { error: `DIAGNOSIS: ${message}` },
      { status: 500 }
    );
  }
}
