import React, { useEffect, useMemo, useState, useCallback } from "react";
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

export default function Schedule() {
  const { userName } = useAuth();
  const [selectedDate, setSelectedDate] = useState(toISODate(startOfToday()));
  const [reservations, setReservations] = useState([]);
  const [bookingHour, setBookingHour] = useState(null);
  const [loading, setLoading] = useState(false);

  const weekDays = useMemo(() => getWeekDays(), []);
  const startDate = toISODate(weekDays[0]);
  const endDate = toISODate(weekDays[weekDays.length - 1]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReservations(startDate, endDate);
      setReservations(data);
    } catch (e) {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const daySlotMap = useMemo(() => {
    const map = {};
    reservations
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
      await cancelReservation(reservation.id, userName);
      toast.success("Reservation cancelled");
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

  const canBook2h = bookingHour !== null && bookingHour < 23 && !daySlotMap[bookingHour + 1];

  // Stats
  const dayReservations = reservations.filter((r) => r.date === selectedDate);
  const occupiedCount = Object.keys(daySlotMap).length;
  const availableCount = 24 - occupiedCount;

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="schedule-page">
      <Header />
      <DaySelector selected={selectedDate} onSelect={setSelectedDate} />

      <div className="max-w-md mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-2 mb-4" data-testid="stats-row">
          <div className="border-2 border-foreground p-3 bg-emerald-500 text-black">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em]">Available</div>
            <div className="font-display text-3xl leading-none mt-1" data-testid="stats-available">
              {availableCount}
            </div>
          </div>
          <div className="border-2 border-foreground p-3 bg-rose-500 text-white">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em]">Booked</div>
            <div className="font-display text-3xl leading-none mt-1" data-testid="stats-booked">
              {occupiedCount}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em]">Time slots · 24h</h2>
          {loading && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Loading…
            </span>
          )}
        </div>

        <div className="space-y-0" data-testid="slot-list">
          {Array.from({ length: 24 }, (_, h) => (
            <SlotRow
              key={h}
              hour={h}
              reservation={daySlotMap[h]}
              currentUser={userName}
              onBook={(hour) => setBookingHour(hour)}
              onCancel={handleCancel}
              onQueue={handleJoinQueue}
              onLeaveQueue={handleLeaveQueue}
            />
          ))}
        </div>

        {dayReservations.length === 0 && (
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
