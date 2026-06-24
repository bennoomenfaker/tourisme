"use client";

import Link from "next/link";
import { ArrowLeft, Leaf, Menu } from "lucide-react";

type NavbarProps = {
  variant?: "home" | "auth";
  currentPage?: "login" | "register" | null;
  backHref?: string;
};

export default function Navbar({
  variant = "home",
  currentPage = null,
  backHref = "/",
}: NavbarProps) {
  const isAuth = variant === "auth";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white px-6 md:px-20 lg:px-40 py-4">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8">
        <div className="flex items-center gap-4 shrink-0">
          {isAuth && (
            <Link
              href={backHref}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 text-slate-900"
          >
            <Leaf className="text-primary w-8 h-8" />
            <h2 className="text-xl font-extrabold tracking-tight">Éco-Voyage</h2>
          </Link>
        </div>

        {!isAuth && (
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/explore" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Explorer
            </Link>
            <Link href="/destinations" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Destinations
            </Link>
            <Link href="/circuits" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Circuits
            </Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Comment ça marche
            </Link>
            <Link href="/eco-projects" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Projets Éco
            </Link>
            <Link href="/impact" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Impact
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/auth/login"
            className={`hidden sm:flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition-all ${
              currentPage === "login"
                ? "bg-slate-200 text-slate-900"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Connexion
          </Link>

          <Link
            href="/auth/register"
            className="flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold bg-primary text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            S&apos;inscrire
          </Link>

          <button className="lg:hidden p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
