import React, { useState } from "react";
import { formatHour } from "../lib/dates";
import { X } from "lucide-react";

export default function BookingModal({ hour, date, onClose, onConfirm, canBook2h }) {
  const [duration, setDuration] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handle = async () => {
    setSubmitting(true);
    try {
      await onConfirm(duration);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
      data-testid="booking-modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-background border-2 border-foreground p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(16,185,129,0.4)]"
        data-testid="booking-modal"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Reserve slot</p>
            <h2 className="font-display text-3xl leading-none mt-1">{formatHour(hour)}</h2>
            <p className="font-mono text-xs text-muted-foreground mt-2">{date}</p>
          </div>
          <button
            onClick={onClose}
            data-testid="booking-modal-close"
            className="border-2 border-foreground p-1.5 hover:-translate-y-0.5 transition-transform"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2">Duration</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1, 2].map((d) => {
            const disabled = d === 2 && !canBook2h;
            return (
              <button
                key={d}
                onClick={() => setDuration(d)}
                disabled={disabled}
                data-testid={`booking-duration-${d}h`}
                className={`border-2 border-foreground py-4 font-display uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-transform ${
                  duration === d && !disabled
                    ? "bg-foreground text-background"
                    : "bg-card text-foreground hover:-translate-y-0.5"
                }`}
              >
                {d}H
                {disabled && (
                  <span className="block text-[9px] mt-1 normal-case tracking-normal">conflicts</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handle}
          disabled={submitting}
          data-testid="booking-confirm-button"
          className="w-full bg-emerald-500 text-black font-display uppercase tracking-wider py-4 border-2 border-foreground hover:-translate-y-1 transition-transform disabled:opacity-50"
        >
          {submitting ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
