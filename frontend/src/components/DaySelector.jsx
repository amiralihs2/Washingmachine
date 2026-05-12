import React from "react";
import { getWeekDays, formatDayShort, formatDayNum, toISODate } from "../lib/dates";

export default function DaySelector({ selected, onSelect }) {
  const days = getWeekDays();
  return (
    <div className="border-b-2 border-foreground bg-background" data-testid="day-selector">
      <div className="max-w-md mx-auto px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {days.map((d, idx) => {
          const iso = toISODate(d);
          const active = iso === selected;
          return (
            <button
              key={iso}
              onClick={() => onSelect(iso)}
              data-testid={`day-button-${iso}`}
              className={`flex-shrink-0 border-2 border-foreground px-3 py-2 min-w-[64px] transition-transform hover:-translate-y-0.5 ${
                active ? "bg-foreground text-background" : "bg-card text-foreground"
              }`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">
                {idx === 0 ? "TODAY" : formatDayShort(d)}
              </div>
              <div className="font-display text-2xl leading-none mt-1">{formatDayNum(d)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
