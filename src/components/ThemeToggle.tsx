"use client";

import { useEffect, useState } from "react";
import { THEME_COOKIE_NAME, Theme } from "@/lib/theme";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export default function ThemeToggle({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  }

  return (
    <button
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="theme-toggle"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        color: "var(--text)",
        cursor: "pointer",
        padding: "8px 12px",
        fontSize: "0.85rem",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
