"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

interface UserProfile {
    name: string;
    motivation: string;
    photo: string;
}

interface Stats {
    decksCreated: number;
    cardsReviewed: number;
    quizzesTaken: number;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile>({
        name: "Siswa FlashMind",
        motivation: "be yourself and never surrender",
        photo: "",
    });

    const [stats, setStats] = useState<Stats>({
        decksCreated: 0,
        cardsReviewed: 0,
        quizzesTaken: 0,
    });

    useEffect(() => {
        const saved = localStorage.getItem("flashmind_profile");
        if (saved) setProfile(JSON.parse(saved));

        const savedStats = localStorage.getItem("flashmind_stats");
        if (savedStats) setStats(JSON.parse(savedStats));
    }, []);

    const save = (newProfile: UserProfile) => {
        setProfile(newProfile);
        localStorage.setItem("flashmind_profile", JSON.stringify(newProfile));
    };

    const reset = () => {
        if (confirm("Apakah Anda yakin ingin menghapus semua data?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-slate-200">
            <Sidebar />
            <main className="flex-1 lg:overflow-y-auto p-4 md:p-8 pt-20 lg:pt-8">
                <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
                    <header>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Profil & Progres — FlashMind+
                        </h1>
                        <p className="text-slate-400 mt-1">Kelola identitas dan pantau perjalanan belajarmu</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Section */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                <h2 className="text-lg font-semibold mb-4 text-slate-100 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    Identitas Pengguna
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => save({ ...profile, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-1">Motivasi Diri</label>
                                        <textarea
                                            value={profile.motivation}
                                            onChange={(e) => save({ ...profile, motivation: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-200 min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* History Timeline placeholder */}
                            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
                                <h2 className="text-lg font-semibold mb-4 text-slate-100 italic">Timeline Belajar</h2>
                                <div className="space-y-4">
                                    <div className="pl-4 border-l-2 border-slate-800 relative py-2">
                                        <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-slate-700"></div>
                                        <p className="text-xs text-slate-500">Baru Saja</p>
                                        <p className="text-sm font-medium text-slate-300">Memulai Perjalanan di FlashMind+</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
                                <h2 className="text-lg font-semibold mb-4 text-slate-100">Statistik Belajar</h2>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Deck Dibuat</span>
                                        <span className="text-indigo-400 font-bold">{stats.decksCreated}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Kartu Diulas</span>
                                        <span className="text-indigo-400 font-bold">{stats.cardsReviewed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Latihan Selesai</span>
                                        <span className="text-indigo-400 font-bold">{stats.quizzesTaken}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={reset}
                                className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/5 transition-colors"
                            >
                                Hapus Semua Data
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
