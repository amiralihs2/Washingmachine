export const toISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekDays = () => {
  const base = startOfToday();
  return Array.from({ length: 7 }, (_, i) => addDays(base, i));
};

export const formatDayShort = (d) =>
  d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();

export const formatDayNum = (d) => String(d.getDate()).padStart(2, "0");

export const formatHour = (h) => `${String(h).padStart(2, "0")}:00`;
