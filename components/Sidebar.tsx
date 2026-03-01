"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlashIcon, QuizIcon, ChatIcon, BrainIcon, MenuIcon, XIcon } from "@/components/Icons";
import { User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/flashcard", label: "Flashcard", icon: FlashIcon },
  { href: "/quiz", label: "Latihan Soal", icon: QuizIcon },
  { href: "/chat", label: "AI Tutor", icon: ChatIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header/Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BrainIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-100">FlashMind</span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
        >
          {isOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar aside */}
      <aside className={cn(
        "fixed lg:sticky top-0 h-screen w-64 lg:w-52 border-r border-slate-800 bg-slate-950 flex flex-col py-7 px-4 z-50 transition-transform duration-300 ease-in-out shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo (Desktop only, or inside mobile side) */}
        <Link href="/" onClick={closeSidebar} className="flex items-center gap-2.5 px-1 mb-8 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
            <BrainIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-100 font-outfit">FlashMind</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all outline-none",
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            onClick={closeSidebar}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all outline-none mt-1",
              pathname === "/profile"
                ? "bg-indigo-500/10 text-indigo-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <User className="w-4 h-4" />
            Profil & Progres
          </Link>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800/50">
          <div className="mb-3 px-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">Llama 3.3 Open Source</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 px-1 opacity-50">Platform Belajar AI</p>
          <p className="text-[10px] text-slate-500 px-1 mt-0.5 font-medium tracking-tight">By Mawan</p>
        </div>
      </aside>
    </>
  );
}
