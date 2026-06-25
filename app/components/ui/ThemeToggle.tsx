"use client";

// Day / night theme switch. Flips data-theme on <html> and persists to
// localStorage. On toggle it plays a sun-rising / moon-rising overlay and
// flips the theme at the animation's apex so the page crossfades underneath.

import { useEffect, useState, useCallback, useRef } from "react";

const KEY = "ccc-theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="5.2" y1="5.2" x2="6.9" y2="6.9" />
      <line x1="17.1" y1="17.1" x2="18.8" y2="18.8" />
      <line x1="18.8" y1="5.2" x2="17.1" y2="6.9" />
      <line x1="6.9" y1="17.1" x2="5.2" y2="18.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z" />
    </svg>
  );
}

type Anim = "toLight" | "toDark" | null;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [anim, setAnim] = useState<Anim>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(cur);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch {}
    };
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      apply();
      setTheme(next);
      return;
    }
    timers.current.forEach(clearTimeout);
    setAnim(next === "light" ? "toLight" : "toDark");
    document.documentElement.classList.add("theme-animating");
    const t1 = setTimeout(() => { apply(); setTheme(next); }, 520);
    const t2 = setTimeout(() => {
      setAnim(null);
      document.documentElement.classList.remove("theme-animating");
    }, 1180);
    timers.current = [t1, t2];
  }, [theme]);

  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title="Day / night"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      {anim && (
        <div className={`theme-transition ${anim}`} aria-hidden="true">
          <div className="tt-sky" />
          <div className="tt-celestial">
            <span className={anim === "toLight" ? "tt-sun" : "tt-moon"} />
          </div>
        </div>
      )}
    </>
  );
}
