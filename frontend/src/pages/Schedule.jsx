import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import DaySelector from "../components/DaySelector";
import SlotRow from "../components/SlotRow";
import BookingModal from "../components/BookingModal";
import { useAuth } from "../context/AuthContext";
import { startOfToday, toISODate, getWeekDays } from "../lib/dates";
import {
  listReservations,
  createReservation,
  cancelReservation,
  joinQueue,
  leaveQueue,
} from "../lib/api";
import { toast } from "sonner";
import { QrCode, Bell } from "lucide-react";

export default function Schedule() {
  const { userName } = useAuth();
  const [selectedDate, setSelectedDate] = useState(toISODate(startOfToday()));
  const [reservations, setReservations] = useState(null);
  const [bookingHour, setBookingHour] = useState(null);
  const notifiedRef = useRef(new Set());

  const weekDays = useMemo(() => getWeekDays(), []);
  const startDate = toISODate(weekDays[0]);
  const endDate = toISODate(weekDays[weekDays.length - 1]);

  const fetchData = useCallback(async () => {
    try {
      const data = await listReservations(startDate, endDate);
      setReservations(data);
    } catch (e) {
      toast.error("Failed to load reservations");
      setReservations([]);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data periodically so multiple users see live updates
  useEffect(() => {
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  // 15-min-before-end reminder toast for the current user's reservations
  useEffect(() => {
    if (!reservations || !userName) return;

    const check = () => {
      const now = new Date();
      reservations
        .filter((r) => r.user_name.toLowerCase() === userName.toLowerCase())
        .forEach((r) => {
          if (notifiedRef.current.has(r.id)) return;
          const [y, m, d] = r.date.split("-").map(Number);
          const endHour = r.start_hour + r.duration;
          const endTime = new Date(y, m - 1, d, endHour, 0, 0, 0);
          const minutesLeft = (endTime.getTime() - now.getTime()) / 60000;
          if (minutesLeft > 0 && minutesLeft <= 15) {
            notifiedRef.current.add(r.id);
            toast(`★ Heads up — your slot ends in ${Math.max(1, Math.round(minutesLeft))} min`, {
              description: `${r.date} · ends at ${String(endHour).padStart(2, "0")}:00`,
              duration: 8000,
              icon: <Bell size={16} />,
            });
          }
        });
    };

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [reservations, userName]);

  // Map hour -> reservation (covers all occupied hours)
  const occupiedMap = useMemo(() => {
    const map = {};
    (reservations || [])
      .filter((r) => r.date === selectedDate)
      .forEach((r) => {
        for (let i = 0; i < r.duration; i++) {
          const h = (r.start_hour + i) % 24;
          map[h] = r;
        }
      });
    return map;
  }, [reservations, selectedDate]);

  const handleBook = async (duration) => {
    try {
      await createReservation({
        user_name: userName,
        date: selectedDate,
        start_hour: bookingHour,
        duration,
      });
      toast.success(`Booked ${duration}h slot at ${String(bookingHour).padStart(2, "0")}:00`);
      setBookingHour(null);
      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Booking failed");
    }
  };

  const handleCancel = async (reservation) => {
    try {
      const res = await cancelReservation(reservation.id, userName);
      if (res?.promoted) {
        toast.success(`Cancelled — passed to ${res.new_owner} (next in queue)`);
      } else {
        toast.success("Reservation cancelled");
      }
      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cancel failed");
    }
  };

  const handleJoinQueue = async (reservation) => {
    try {
      await joinQueue(reservation.id, userName);
      toast.success("You're in the queue");
      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not join queue");
    }
  };

  const handleLeaveQueue = async (reservation) => {
    try {
      await leaveQueue(reservation.id, userName);
      toast.success("Left the queue");
      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not leave queue");
    }
  };

  const canBook2h = bookingHour !== null && bookingHour < 23 && !occupiedMap[bookingHour + 1];

  // Counters
  const occupiedCount = Object.keys(occupiedMap).length;
  const availableCount = 24 - occupiedCount;

  const loading = reservations === null;

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="schedule-page">
      <Header />
      <DaySelector selected={selectedDate} onSelect={setSelectedDate} />

      <div className="max-w-md mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-2 mb-4" data-testid="stats-row">
          <div className="border-2 border-foreground p-3 bg-emerald-500 text-black">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em]">Available</div>
            <div className="font-display text-3xl leading-none mt-1" data-testid="stats-available">
              {loading ? "--" : availableCount}
            </div>
          </div>
          <div className="border-2 border-foreground p-3 bg-rose-500 text-white">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em]">Booked</div>
            <div className="font-display text-3xl leading-none mt-1" data-testid="stats-booked">
              {loading ? "--" : occupiedCount}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em]">Time slots · 24h</h2>
          <Link
            to="/qr"
            data-testid="qr-link"
            className="font-mono text-[10px] uppercase tracking-[0.2em] border-2 border-foreground px-2 py-1 hover:-translate-y-0.5 transition-transform flex items-center gap-1"
          >
            <QrCode size={12} /> QR
          </Link>
        </div>

        {loading ? (
          <div className="space-y-0" data-testid="slot-skeleton">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="grid grid-cols-[64px_1fr] gap-3 items-stretch py-1.5">
                <div className="self-center h-4 w-12 bg-muted animate-pulse" />
                <div className="h-12 bg-muted animate-pulse border-2 border-foreground/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0" data-testid="slot-list">
            {(() => {
              const rows = [];
              let h = 0;
              while (h < 24) {
                const res = occupiedMap[h];
                if (res && res.start_hour === h) {
                  rows.push(
                    <SlotRow
                      key={h}
                      hour={h}
                      reservation={res}
                      currentUser={userName}
                      onBook={() => {}}
                      onCancel={handleCancel}
                      onQueue={handleJoinQueue}
                      onLeaveQueue={handleLeaveQueue}
                    />
                  );
                  h += res.duration; // skip continuation hours
                } else if (res) {
                  // continuation of a reservation we've already rendered — skip
                  h += 1;
                } else {
                  rows.push(
                    <SlotRow
                      key={h}
                      hour={h}
                      reservation={null}
                      currentUser={userName}
                      onBook={(hour) => setBookingHour(hour)}
                      onCancel={() => {}}
                      onQueue={() => {}}
                      onLeaveQueue={() => {}}
                    />
                  );
                  h += 1;
                }
              }
              return rows;
            })()}
          </div>
        )}

        {!loading && occupiedCount === 0 && (
          <p className="text-center font-mono text-xs text-muted-foreground mt-6 uppercase tracking-[0.2em]">
            ★ all clear · machine is free all day
          </p>
        )}
      </div>

      {bookingHour !== null && (
        <BookingModal
          hour={bookingHour}
          date={selectedDate}
          canBook2h={canBook2h}
          onClose={() => setBookingHour(null)}
          onConfirm={handleBook}
        />
      )}
    </div>
  );
}
