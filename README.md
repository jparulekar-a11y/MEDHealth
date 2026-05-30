# MEDHealth — Real-Time Healthcare Platform

A full-stack healthcare monitoring app with **real WebSocket updates**, persistent database storage, and live care team coordination — not simulated data.

## Features

- **Live Vitals Monitoring** — Heart rate, blood pressure, SpO2, and temperature streamed instantly via Socket.io when recorded
- **Clinical Alerts** — Automatic threshold detection creates real alerts broadcast to all connected clients
- **Care Chat** — Real-time messaging between patients and care staff
- **Appointments** — Schedule and update visit status with live sync across dashboards
- **Persistent Storage** — SQLite database via Prisma (swap to PostgreSQL for production)

## Quick Start

```bash
# Install dependencies
npm install

# Set up database and seed sample patients
npm run db:setup

# Start dev server (Next.js + Socket.io on port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Launch Care Dashboard**.

## Real-Time Demo

1. Open the dashboard in **two browser tabs**
2. Select a patient (e.g. John Doe)
3. Click **New Reading** and enter vitals — or use values outside normal range (e.g. SpO2: 88) to trigger alerts
4. Watch both tabs update instantly without refreshing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Real-time | Socket.io (WebSockets) |
| Database | Prisma + SQLite |
| Server | Custom Node.js server (`server.ts`) |

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List all patients with latest vitals |
| GET/POST | `/api/vitals` | Read/create vital readings |
| GET/PATCH | `/api/alerts` | List/acknowledge alerts |
| GET/POST | `/api/messages` | Chat messages |
| GET/PATCH/POST | `/api/appointments` | Appointments |
| GET | `/api/staff` | Care team members |

## Project Structure

```
MEDHealth/
├── app/                  # Next.js pages & API routes
├── components/           # React UI components
├── lib/                  # Prisma, Socket.io, utilities
├── prisma/               # Database schema & seed
└── server.ts             # Custom server (Next.js + Socket.io)
```

## Production Notes

- Replace SQLite with PostgreSQL: update `provider` and `DATABASE_URL` in `prisma/schema.prisma`
- Add authentication (NextAuth, Clerk, etc.) before deploying with real patient data
- Configure HTTPS and secure WebSocket connections for HIPAA compliance
