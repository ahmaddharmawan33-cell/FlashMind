import Groq from "groq-sdk";

let _client: Groq | null = null;

export function getClient(): Groq {
    if (!_client) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY tidak ditemukan. Harap isi API Key Groq di .env.local.");
        }
        _client = new Groq({ apiKey });
    }
    return _client;
}

export const OPEN_SOURCE_INFO = "Powered by Llama 3.3 (Open Source)";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function cleanJson(raw: string): string {
    // Cari index pertama [ atau { dan terakhir ] atau }
    const firstBracket = Math.min(
        raw.indexOf("[") === -1 ? Infinity : raw.indexOf("["),
        raw.indexOf("{") === -1 ? Infinity : raw.indexOf("{")
    );
    const lastBracket = Math.max(raw.lastIndexOf("]"), raw.lastIndexOf("}"));

    if (firstBracket === Infinity || lastBracket === -1) {
        return raw.replace(/```json|```/g, "").trim();
    }

    return raw.substring(firstBracket, lastBracket + 1).trim();
}

/**
 * Generate Flashcards with Deep Learning+ approach
 */
export async function generateFlashcards(
    materi: string,
    count: number = 10,
    difficulty: "mudah" | "lumayan" | "susah" = "lumayan",
    isPlus: boolean = false
): Promise<Array<{ front: string; back: string }>> {
    const client = getClient();

    const difficultyPrompt = {
        mudah: "Gunakan bahasa yang sederhana, fokus pada konsep dasar, dan berikan penjelasan yang mudah dicerna.",
        lumayan: "Berikan penjelasan yang detail, komprehensif, dan mencakup terminologi teknis yang relevan.",
        susah: "Gunakan pendekatan HOTS (Higher Order Thinking Skills), hubungkan dengan konsep tingkat tinggi, dan berikan analisis kritis yang mendalam."
    }[difficulty];

    const completion = await client.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: `Kamu adalah FlashMind Plus — pakar pembelajaran mendalam yang luar biasa detail.
Output HANYA berupa JSON array yang valid.
Format: [{"front": "...", "back": "..."}]
${isPlus ? "ATURAN PLUS: Berikan analisis yang sangat ekstrim detailnya, sertakan analogi kompleks dan hubungkan dengan konsep lain yang relevan." : "ATURAN: " + difficultyPrompt}
- BUAT TEPAT ${count} KARTU. Jangan kurang, jangan lebih. Ini sangat penting.
- Bahasa Indonesia yang sangat elegan.`,
            },
            { role: "user", content: `Buat EXACTLY ${count} flashcard ${isPlus ? "Deep Learning+" : "Deep Learning"} dengan tingkat kesulitan ${difficulty} dari materi:\n\n${materi}` },
        ],
        temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const cleaned = cleanJson(raw);
    try {
        const cards = JSON.parse(cleaned);
        return Array.isArray(cards) ? cards.slice(0, count) : [];
    } catch (err) {
        console.error("Gagal parse JSON Flashcards:", err);
        throw new Error("AI gagal dalam menghasilkan format data yang tepat. Coba materi yang lebih spesifik.");
    }
}

/**
 * Generate Questions with Deep Analysis
 */
export async function generateQuestions(
    materi: string,
    count: number = 5,
    difficulty: "mudah" | "lumayan" | "susah" = "susah"
): Promise<Array<{ soal: string; opsi: string[]; jawaban: number; pembahasan: string; }>> {
    const client = getClient();

    const difficultyPrompt = {
        mudah: "Pertanyaan bersifat langsung, menguji pemahaman dasar dan definisi.",
        lumayan: "Pertanyaan membutuhkan pemahaman konsep yang baik dan penerapan materi.",
        susah: "Pertanyaan bersifat HOTS (Higher Order Thinking Skills), membutuhkan analisis kritis, sintesis, dan evaluasi mendalam."
    }[difficulty];

    const completion = await client.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: `Kamu adalah spesialis evaluasi pendidikan yang ahli dalam merancang soal-soal berkualitas tinggi.
Output HANYA berupa JSON array yang valid.
Format output:
[
  {
    "soal": "isi soal",
    "opsi": ["Opsi A", "Opsi B", "Opsi C", "Opsi D", "Opsi E"],
    "jawaban": 0,
    "pembahasan": "penjelasan yang sangat detail dan logis mengenai jawaban yang benar"
  }
]
Aturan: 
- BUAT TEPAT ${count} SOAL. Jangan kurang, jangan lebih.
- Pilihan ganda A sampai E (5 opsi).
- Tingkat kesulitan: ${difficulty} (${difficultyPrompt}).
- Bahasa Indonesia yang baku dan profesional.`,
            },
            { role: "user", content: `Buat EXACTLY ${count} soal latihan dengan tingkat kesulitan ${difficulty} dari materi berikut:\n\n${materi}` },
        ],
        temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const cleaned = cleanJson(raw);
    try {
        const questions = JSON.parse(cleaned);
        return Array.isArray(questions) ? questions.slice(0, count) : [];
    } catch (err) {
        console.error("Gagal parse JSON Questions:", err);
        throw new Error("Gagal memproses soal latihan. Silakan coba lagi.");
    }
}

/**
 * Chat with AI Tutor in Research Mode (asking questions back)
 */
export async function chatWithTutor(
    history: Array<{ role: "user" | "assistant"; content: string }>,
    userMessage: string
): Promise<string> {
    const client = getClient();
    const messages = [
        {
            role: "system" as const,
            content: `Kamu adalah FlashMind AI Research Companion — tutor yang tidak hanya memberikan jawaban, tetapi juga memicu riset dan pemikiran kritis (Metode Sokratik).
Gaya Komunikasi:
- Berikan penjelasan yang SANGAT DETAIL dan MENDALAM (Deep Learning style).
- Selalu akhiri respon dengan pertanyaan riset yang menantang pengguna untuk berpikir lebih jauh atau menggali detail yang belum dibahas.
- Jadilah asisten yang interaktif seperti ChatGPT/Claude dalam mode riset.
- Gunakan bahasa Indonesia yang ramah namun intelek.`,
        },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: userMessage },
    ];

    const completion = await client.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Maaf, saya sedang mengalami kendala teknis.";
}
