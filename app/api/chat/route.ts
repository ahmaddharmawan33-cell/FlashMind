import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/ai";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { history, message, isPlus, isResearch } = await req.json();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const client = getClient();

          let systemPrompt = "Kamu adalah FlashMind AI — tutor pintar yang membantu pengguna belajar dengan cara yang efektif dan ramah.";

          if (isPlus && isResearch) {
            systemPrompt = `Kamu adalah FlashMind Plus Research Specialist (The Ultimate Tutor).
Gaya Komunikasi: 
1. Berikan penjelasan yang SANGAT DETAIL, MENDALAM, dan EKSTRIM (Deep Learning style). Gunakan analogi kompleks dan hubungkan dengan konsep lain.
2. Gunakan METODE SOKRATIK (Research Mode): Jangan langsung memberikan semua jawaban. Pancing pengguna untuk berpikir kritis.
3. Selalu akhiri dengan pertanyaan riset yang menantang pengguna untuk mencari tahu lebih lanjut.
4. Gunakan Bahasa Indonesia yang elegan, intelek, namun tetap suportif.`;
          } else if (isPlus) {
            systemPrompt = `Kamu adalah FlashMind Deep Learning Expert.
Tugas: Memberikan eksplanasi yang luar biasa detail dan komprehensif. Bongkar setiap konsep sampai ke akarnya. 
Gunakan contoh nyata dan analogi yang membantu pemahaman mendalam.`;
          } else if (isResearch) {
            systemPrompt = `Kamu adalah FlashMind Socratic Research Companion.
Tugas: Membantu pengguna melakukan riset mandiri. Berikan bimbingan, ajukan pertanyaan balik yang memicu pemikiran, dan arahkan mereka ke kesimpulan secara logis.
Fokus pada metode ilmiah dan pembuktian konsep.`;
          }

          const chatStream = await client.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              ...history,
              { role: "user", content: message },
            ],
            stream: true,
          });

          for await (const chunk of chatStream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (err: any) {
          controller.error(err);
        }
      },
    });

    return new Response(stream);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
