import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const listReservations = async (startDate, endDate) => {
  const { data } = await api.get(`/reservations`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return data;
};

export const createReservation = async ({ user_name, date, start_hour, duration }) => {
  const { data } = await api.post(`/reservations`, { user_name, date, start_hour, duration });
  return data;
};

export const cancelReservation = async (id, user_name) => {
  const { data } = await api.delete(`/reservations/${id}`, { data: { user_name } });
  return data;
};

export const joinQueue = async (id, user_name) => {
  const { data } = await api.post(`/reservations/${id}/queue`, { user_name });
  return data;
};

export const leaveQueue = async (id, user_name) => {
  const { data } = await api.delete(`/reservations/${id}/queue`, { data: { user_name } });
  return data;
};
