import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, LogOut } from "lucide-react";

export default function Header() {
  const { userName, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b-2 border-foreground" data-testid="app-header">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl leading-none" data-testid="brand-logo">
            WASH<span className="bg-foreground text-background px-1">SLOT</span>
          </h1>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
            // {userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            data-testid="theme-toggle"
            aria-label="Toggle theme"
            className="border-2 border-foreground p-2 hover:-translate-y-0.5 transition-transform"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={logout}
            data-testid="logout-button"
            aria-label="Logout"
            className="border-2 border-foreground p-2 hover:-translate-y-0.5 transition-transform"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
