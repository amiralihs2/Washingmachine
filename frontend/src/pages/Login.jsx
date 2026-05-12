import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, ArrowRight, WashingMachine } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col" data-testid="login-page">
      <header className="flex justify-end p-4">
        <button
          onClick={toggle}
          data-testid="theme-toggle"
          className="border-2 border-foreground p-2 hover:-translate-y-0.5 transition-transform"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 border-2 border-foreground px-3 py-1 mb-6 font-mono text-xs tracking-[0.2em]">
            <WashingMachine size={14} /> DORM UTILITY
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-none mb-3" data-testid="login-title">
            WASH<span className="bg-foreground text-background px-2">SLOT</span>
          </h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
            // shared laundry, zero arguments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <label className="block font-mono text-xs uppercase tracking-[0.2em]">
            Enter your name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            data-testid="login-name-input"
            autoFocus
            className="w-full bg-card border-2 border-foreground px-4 py-4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-foreground placeholder:text-muted-foreground rounded-none"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            data-testid="login-submit-button"
            className="w-full bg-foreground text-background font-display uppercase tracking-wider py-4 border-2 border-foreground disabled:opacity-40 hover:-translate-y-1 transition-transform flex items-center justify-center gap-2"
          >
            Enter <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-8 font-mono text-xs text-muted-foreground">
          ★ No passwords. Your name acts as your identity in the dorm.
        </p>
      </main>

      <footer className="p-4 font-mono text-[10px] text-muted-foreground text-center uppercase tracking-[0.3em]">
        v1.0 · washslot
      </footer>
    </div>
  );
}
