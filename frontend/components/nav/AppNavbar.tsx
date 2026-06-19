"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Leaf, User } from "lucide-react";
import { apiFetch } from "@/lib/api";

type AppNavbarProps = {
  title?: string;
};

export default function AppNavbar({ title }: AppNavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; role?: string } | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const token = localStorage.getItem("token");
    if (token) {
      apiFetch<{ count: number }>("/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((d) => setUnread(d.count))
        .catch(() => {});
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md px-4 md:px-8 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-800"
          >
            <Leaf className="text-primary w-7 h-7" />
            <span className="text-lg font-extrabold tracking-tight hidden sm:inline">Éco-Voyage</span>
          </Link>
          {title && (
            <>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-sm font-semibold text-slate-500 hidden sm:inline">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden md:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            Tableau de bord
          </Link>

          <Link
            href="/circuits"
            className="hidden md:flex text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            Circuits
          </Link>

          <Link
            href="/notifications"
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-primary transition-all"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-all"
          >
            <User size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
