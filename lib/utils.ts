export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const LEITNER_BOXES = [
  {
    label: "Kotak 1",
    sub: "Review setiap hari",
    dotColor: "bg-red-500",
    textColor: "text-red-400",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-800/50",
  },
  {
    label: "Kotak 2",
    sub: "Review tiap 2 hari",
    dotColor: "bg-amber-500",
    textColor: "text-amber-400",
    bgColor: "bg-amber-900/20",
    borderColor: "border-amber-800/50",
  },
  {
    label: "Kotak 3",
    sub: "Review tiap 5 hari",
    dotColor: "bg-sky-500",
    textColor: "text-sky-400",
    bgColor: "bg-sky-900/20",
    borderColor: "border-sky-800/50",
  },
  {
    label: "Kotak 4",
    sub: "Sudah hafal ✓",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-900/20",
    borderColor: "border-emerald-800/50",
  },
] as const;

export const OPTION_LETTERS = ["A", "B", "C", "D", "E"] as const;
