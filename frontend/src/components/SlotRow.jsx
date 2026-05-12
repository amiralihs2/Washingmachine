import React, { useState } from "react";
import { formatHour } from "../lib/dates";
import { Plus, X, Users, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function SlotRow({ hour, reservation, currentUser, onBook, onCancel, onQueue, onLeaveQueue }) {
  const time = formatHour(hour);
  const [showQueue, setShowQueue] = useState(false);

  if (!reservation) {
    return (
      <div className="grid grid-cols-[64px_1fr] gap-3 items-stretch py-1.5" data-testid={`slot-row-${hour}`}>
        <div className="font-mono text-sm text-muted-foreground self-center">{time}</div>
        <button
          onClick={() => onBook(hour)}
          data-testid={`slot-book-${hour}`}
          className="flex justify-between items-center bg-emerald-500 text-black px-4 py-3 border-2 border-black dark:border-emerald-300 hover:-translate-y-0.5 transition-transform"
        >
          <span className="font-display uppercase tracking-wider text-sm">Available</span>
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
    );
  }

  // Reservation start row (merged block spanning its full duration)
  const mine = reservation.user_name.toLowerCase() === currentUser.toLowerCase();
  const endHour = (reservation.start_hour + reservation.duration) % 24;
  const inQueue = (reservation.queue || []).some(q => q.toLowerCase() === currentUser.toLowerCase());
  const queueCount = reservation.queue?.length || 0;

  return (
    <div
      className="grid grid-cols-[64px_1fr] gap-3 items-stretch py-1.5"
      data-testid={`slot-row-${hour}`}
      style={{ minHeight: `${reservation.duration * 60}px` }}
    >
      <div className="font-mono text-sm text-muted-foreground self-start pt-3">{time}</div>
      <div
        className={`flex flex-col px-4 py-3 border-2 ${
          mine
            ? "bg-rose-900 text-white border-rose-400"
            : "bg-rose-500 text-white border-black dark:border-rose-300"
        }`}
        data-testid={`slot-booked-${hour}`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-display uppercase tracking-wider text-base truncate" data-testid={`slot-user-${hour}`}>
              {mine ? `You · ${reservation.user_name}` : reservation.user_name}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-90 flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatHour(reservation.start_hour)}–{formatHour(endHour)}
              </span>
              <span>· {reservation.duration}h</span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {mine ? (
              <button
                onClick={() => onCancel(reservation)}
                data-testid={`slot-cancel-${hour}`}
                className="border-2 border-white px-2 py-1 text-[10px] font-display uppercase hover:bg-white hover:text-rose-900 transition-colors flex items-center gap-1"
              >
                <X size={12} /> Cancel
              </button>
            ) : inQueue ? (
              <button
                onClick={() => onLeaveQueue(reservation)}
                data-testid={`slot-leave-queue-${hour}`}
                className="bg-white text-rose-700 px-2 py-1 text-[10px] font-display uppercase hover:bg-gray-100"
              >
                Leave queue
              </button>
            ) : (
              <button
                onClick={() => onQueue(reservation)}
                data-testid={`slot-join-queue-${hour}`}
                className="bg-white text-rose-700 px-2 py-1 text-[10px] font-display uppercase hover:bg-gray-100"
              >
                Join queue
              </button>
            )}
          </div>
        </div>

        {queueCount > 0 && (
          <div className="mt-2 pt-2 border-t border-white/30">
            <button
              onClick={() => setShowQueue((s) => !s)}
              data-testid={`slot-queue-toggle-${hour}`}
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] opacity-90 hover:opacity-100"
            >
              <Users size={10} />
              Queue · {queueCount}
              {showQueue ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showQueue && (
              <ol
                className="mt-1 font-mono text-[11px] space-y-0.5 list-decimal list-inside opacity-95"
                data-testid={`slot-queue-list-${hour}`}
              >
                {reservation.queue.map((q, i) => (
                  <li key={`${q}-${i}`}>{q}</li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
