# WashSlot

A full-stack reservation system for managing shared dorm washing machine time slots.

**Live Demo:** https://washslot.vercel.app  
**Repository:** https://github.com/amiralihs2/Washingmachine

---

## Overview

WashSlot is a simple, mobile-friendly web application built to solve a real scheduling problem in shared accommodation.

In a dorm or shared flat, residents often do not know when the washing machine is free, already booked, or currently in use. This can lead to confusion, repeated messages, and scheduling conflicts.

WashSlot provides a shared booking platform where residents can enter their name, view available laundry slots, reserve a time, cancel their own reservation, and join a queue for already-booked slots.

---

## Problem

A shared washing machine was being used by multiple residents without a clear reservation system.

Common problems included:

- People not knowing when the machine was available
- Overlapping laundry plans
- Repeated messages in group chats
- No clear ownership of booked time slots
- No simple way to queue for a busy slot

---

## Solution

WashSlot replaces informal chat-based coordination with a clear reservation interface.

Users can:

- Enter their name without creating an account
- View the current weekly schedule
- Book available laundry slots
- Cancel their own reservations
- Join or leave queues for occupied slots
- Access the app easily from mobile devices

The goal is to reduce conflicts and make shared resource usage more transparent.

---

## Features

- Lightweight name-based login
- Weekly schedule view
- 24-hour time slot display
- Reservation creation
- Reservation cancellation
- Queue system for booked slots
- Automatic refresh every 30 seconds
- 15-minute reminder before a user's slot ends
- Mobile-friendly responsive design
- Dark/light mode support
- QR page for quick access near the washing machine
- Persistent data storage with MongoDB Atlas

---

## Tech Stack

### Frontend

- React
- React Router
- Axios
- Tailwind CSS
- Sonner toast notifications
- Lucide React icons
- Vercel deployment

### Backend

- FastAPI
- Uvicorn
- Python
- MongoDB async client
- Render deployment

### Database

- MongoDB Atlas

---

## Architecture

```text
User Browser
    |
    v
React Frontend
Hosted on Vercel
    |
    v
FastAPI Backend
Hosted on Render
    |
    v
MongoDB Atlas
Cloud Database
```

---

## Deployment

### Frontend

The frontend is deployed on Vercel.

Required environment variable:

```env
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

### Backend

The backend is deployed on Render.

Required environment variables:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=washslot
```

### Database

MongoDB Atlas is used for persistent reservation data.

For cloud deployment, the MongoDB Atlas network access list must allow the backend host to connect.

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/amiralihs2/Washingmachine.git
cd Washingmachine
```

### 2. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

Create a `.env` file or set environment variables for:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=washslot
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm start
```

Create a `.env` file in the frontend folder:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## API Overview

Main reservation endpoints include:

```text
GET    /api/reservations
POST   /api/reservations
DELETE /api/reservations/{id}
POST   /api/reservations/{id}/queue
DELETE /api/reservations/{id}/queue
```

These endpoints allow the frontend to list reservations, create bookings, cancel bookings, and manage queue participation.

---

## Why I Built This

I built WashSlot to solve a real coordination problem in my dorm. Instead of relying on group chat messages or verbal agreements, I wanted to create a practical reservation system that everyone could access from their phone.

This project helped me practice full-stack development, deployment, API integration, environment variable management, and cloud database configuration.

---

## What I Learned

Through this project, I worked with:

- Building a React frontend
- Connecting frontend and backend APIs
- Creating a FastAPI backend
- Deploying frontend on Vercel
- Deploying backend on Render
- Configuring MongoDB Atlas
- Managing environment variables in production
- Debugging dependency and deployment issues
- Solving a real-world scheduling problem with software

---

## Future Improvements

- Google login or stronger user authentication
- Admin panel for managing all reservations
- Push notifications or email reminders
- Support for multiple washing machines
- Support for other shared resources such as dryers, kitchens, tools, or study rooms
- Better analytics for usage patterns
- QR code printed and placed near the washing machine
- PWA support for installing the app on phones

---

## Project Status

MVP is deployed and functional.

Current live version:

https://washslot.vercel.app
