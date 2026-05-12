import React, { useEffect, useState, useMemo } from "react";
import { toISODate, startOfToday } from "../lib/dates";

const TICK_MS = 30000;

export default function MachineState({ reservations }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const todayISO = toISODate(startOfToday());

  const state = useMemo(() => {
    if (!reservations) return { kind: "loading" };

    const todayRes = reservations.filter((r) => r.date === todayISO);
    const minutesNow = now.getHours() * 60 + now.getMinutes();

    // Currently active reservation
    const active = todayRes.find((r) => {
      const start = r.start_hour * 60;
      const end = (r.start_hour + r.duration) * 60;
      return minutesNow >= start && minutesNow < end;
    });

    if (active) {
      const endMin = (active.start_hour + active.duration) * 60;
      const minsLeft = Math.max(1, endMin - minutesNow);
      return {
        kind: "busy",
        user: active.user_name,
        endHour: active.start_hour + active.duration,
        minsLeft,
      };
    }

    // Find next upcoming reservation today
    const upcoming = todayRes
      .filter((r) => r.start_hour * 60 > minutesNow)
      .sort((a, b) => a.start_hour - b.start_hour)[0];

    if (upcoming) {
      const minsTo = upcoming.start_hour * 60 - minutesNow;
      if (minsTo <= 60) {
        return { kind: "free_briefly", startHour: upcoming.start_hour, minsTo, user: upcoming.user_name };
      }
    }
    return { kind: "free" };
  }, [reservations, todayISO, now]);

  if (state.kind === "loading") {
    return (
      <div
        className="border-2 border-foreground p-3 bg-card mb-4 animate-pulse h-[68px]"
        data-testid="machine-state-loading"
      />
    );
  }

  if (state.kind === "busy") {
    return (
      <div
        className="border-2 border-foreground p-3 bg-rose-500 text-white mb-4 flex items-center gap-3"
        data-testid="machine-state-busy"
      >
        <span className="text-3xl leading-none" aria-hidden>🔴</span>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-90">Machine state · now</div>
          <div className="font-display text-base uppercase leading-tight truncate">
            In use by {state.user}
          </div>
          <div className="font-mono text-xs mt-0.5">
            ends {String(state.endHour).padStart(2, "0")}:00 · ~{state.minsLeft} min left
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === "free_briefly") {
    return (
      <div
        className="border-2 border-foreground p-3 bg-yellow-300 text-black mb-4 flex items-center gap-3"
        data-testid="machine-state-free-briefly"
      >
        <span className="text-3xl leading-none" aria-hidden>🟡</span>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">Machine state · now</div>
          <div className="font-display text-base uppercase leading-tight">Free for ~{state.minsTo} min</div>
          <div className="font-mono text-xs mt-0.5">
            next: {state.user} at {String(state.startHour).padStart(2, "0")}:00
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-foreground p-3 bg-emerald-500 text-black mb-4 flex items-center gap-3"
      data-testid="machine-state-free"
    >
      <span className="text-3xl leading-none" aria-hidden>🟢</span>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">Machine state · now</div>
        <div className="font-display text-base uppercase leading-tight">Free — go do laundry</div>
      </div>
    </div>
  );
}
