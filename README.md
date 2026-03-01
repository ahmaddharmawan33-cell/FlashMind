# FlashMind 🧠

Platform belajar SNBT berbasis AI — Flashcard adaptif, soal latihan, dan tutor AI personal.

## Fitur

- **Flashcard AI** — Tempel materi → AI generate kartu pertanyaan/jawaban → belajar dengan flip card + sistem Leitner otomatis
- **Latihan Soal AI** — Tempel materi → AI generate 5 soal pilihan ganda SNBT + pembahasan lengkap
- **AI Tutor Chat** — Tanya apa saja tentang materi SNBT, AI menjawab layaknya guru pribadi

## Tech Stack

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS**
- **Anthropic Claude API** (server-side, aman)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Buat file `.env.local`

```bash
cp .env.local.example .env.local
```

Isi `ANTHROPIC_API_KEY` dengan API key kamu dari [console.anthropic.com](https://console.anthropic.com).

### 3. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Struktur Project

```
flashmind/
├── app/
│   ├── api/
│   │   ├── flashcards/route.ts   ← Generate flashcard dari AI
│   │   ├── questions/route.ts    ← Generate soal dari AI
│   │   └── chat/route.ts         ← AI Tutor chat
│   ├── flashcard/page.tsx        ← Halaman flashcard
│   ├── quiz/page.tsx             ← Halaman latihan soal
│   ├── chat/page.tsx             ← Halaman AI tutor
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Sidebar.tsx               ← Navigasi sidebar
│   ├── FlipCard.tsx              ← Komponen flip card + Leitner
│   ├── QuizCard.tsx              ← Komponen soal latihan
│   ├── ChatBox.tsx               ← Komponen chat
│   └── Icons.tsx                 ← SVG icons
├── lib/
│   ├── anthropic.ts              ← Server-side AI helper
│   ├── types.ts                  ← TypeScript types
│   └── utils.ts                  ← Utility functions
└── README.md
```

## Sistem Leitner

Flashcard menggunakan sistem Leitner (Spaced Repetition):

| Kotak | Review | Kondisi |
|-------|--------|---------|
| Kotak 1 🔴 | Setiap hari | Kartu baru / salah |
| Kotak 2 🟡 | Tiap 2 hari | Benar sekali |
| Kotak 3 🔵 | Tiap 5 hari | Benar dua kali |
| Kotak 4 🟢 | Sudah hafal | Benar tiga kali |

Jawab **benar** → kartu naik kotak. Jawab **salah** → kembali ke Kotak 1.
