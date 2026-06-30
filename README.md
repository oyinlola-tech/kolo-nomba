# Kolo Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB"/>
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4"/>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success"/>
</p>

<p align="center">
  <strong>Frontend for Kolo — Digital Cooperative Savings Platform for Modern Africa</strong>
</p>

---

## Overview

Kolo digitizes traditional African savings systems — **Ajo**, **Esusu**, **thrift contributions**, and **cooperative savings groups**. This is the standalone React frontend SPA that communicates with a separate backend API.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** + TypeScript | UI framework |
| **Vite 8** | Build tool and dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **TanStack Query 5** | Server state management and caching |
| **Zustand 5** | Client state (auth, theme, UI) |
| **React Router 8** | SPA routing |
| **Axios** | HTTP client with token refresh interceptor |
| **Recharts** | Data visualization and charts |
| **Lucide React** | Icons |
| **Sonner** | Toast notifications |

---

## Project Structure

```
public/                          # Frontend root
├── src/
│   ├── api/                     # Axios client with auth interceptor
│   ├── app/                     # Router, providers, Zustand store
│   ├── components/
│   │   ├── layout/              # AppLayout, AuthLayout, SidebarLink
│   │   ├── shared/              # Button, Input, Card, Badge, etc.
│   │   └── ui/                  # shadcn/ui primitives
│   ├── features/
│   │   ├── landing/             # Public marketing pages (10 pages)
│   │   ├── auth/                # Login, register, OTP, password reset
│   │   ├── admin/               # Super Admin dashboard (14 pages)
│   │   ├── group/               # Group Admin dashboard (10 pages)
│   │   └── member/              # Member dashboard (9 pages)
│   ├── hooks/                   # TanStack Query hooks (21 files)
│   ├── services/                # API service functions (20 files)
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Formatting, environment helpers
│   └── styles/                  # CSS (Tailwind, theme, fonts)
├── .env.example                 # Environment variable template
├── index.html                   # Entry HTML
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

---

## Quick Start

### Prerequisites

- Node.js 20+

### Setup

```bash
# Navigate to frontend directory
cd public

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend API URL:
# VITE_API_URL=https://your-backend.com/api/v1

# Start development server
npm run dev
```

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` | TypeScript type checking |
| `npm run start` | Serve production build via `serve` |

---

## Environment Variables

All frontend environment variables are prefixed with `VITE_`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | — | Backend API base URL (e.g., `https://api.example.com/api/v1`) |
| `VITE_APP_NAME` | No | `Kolo` | Application display name |

**Example `.env`:**

```env
VITE_API_URL=https://api.kolo.example.com/api/v1
VITE_APP_NAME=Kolo
```

The `VITE_API_URL` is validated at runtime. If missing, the app shows a clear error message and refuses to start.

---

## Deployment

### Build

```bash
npm run build
```

Output goes to `dist/`. Deploy the contents of `dist/` to any static host.

### SPA Routing

This is a single-page application. Your web server must serve `index.html` for all routes to support client-side routing and deep linking (e.g., page refresh on `/member/home` must return `index.html`).

#### Vercel

Add `vercel.json`:

```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

#### Netlify

Add `public/_redirects`:

```
/*    /index.html    200
```

#### Cloudflare Pages

No additional config needed — Cloudflare Pages handles SPA mode automatically via its SPA setting.

#### Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Paxel

Configured in `pxxl.json`. The build command is `npm run build` and the output directory is `dist`.

---

## API Communication

The frontend communicates with an external backend via REST API:

- **Base URL**: Set via `VITE_API_URL` environment variable
- **Authentication**: JWT access tokens (in-memory) + HttpOnly refresh cookies
- **HTTP Client**: Axios with request/response interceptors
- **Error Handling**: Token refresh on 401 with request queue

All API requests go through:
```
Component → Hook → Service → API Client → Backend
```

---

## Authentication Flow

1. **Login**: `POST /auth/login` → returns `{ user, accessToken }`
2. **App Init**: `POST /auth/refresh` → attempts silent refresh via HttpOnly cookie
3. **Profile**: `GET /auth/me` → fetches user on token refresh
4. **Logout**: `POST /auth/logout` → clears server session + client state
5. **Token Refresh**: Automatic on 401 via response interceptor
6. **Protected Routes**: Role-based guard with hydration timeout

---

## Features

### Landing Pages
- Home, How It Works, Pricing, Security, About, Contact, Help, Terms, Privacy

### Authentication
- Member registration, Cooperative registration, Login, OTP verification, Password reset

### Member Dashboard
- Home (virtual account, active group, quick actions)
- Contribution payments (card + bank transfer)
- Payment history with receipts
- Group detail view
- Notifications
- Profile & settings

### Group Admin Dashboard
- Dashboard with savings analytics
- Member management
- Contribution tracking
- Transaction history
- Payout management
- Reports and payment analytics
- Group settings

### Super Admin Dashboard
- Platform overview with metrics
- User and group management
- Transaction and payment monitoring
- Revenue analytics
- Withdrawals, disputes, KYC verification
- Security settings, audit logs

---

## Virtual Account Support

The frontend supports displaying virtual account information provided by the backend:

- Account number (with copy button)
- Bank name
- Account holder name
- Loading, empty, and error states
- "Generate Account" CTA when no account exists

---

## Payment Support

- **Card Payments**: Redirect to checkout URL provided by backend
- **Bank Transfer**: Display virtual account details with copy functionality
- **Success Page**: Reference number, receipt download
- **Error Handling**: Payment failure messages with retry

---

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Android Chrome)

---

## License

Licensed under the terms specified in `LICENSE.md`.

---

## Author

**Oluwayemi Oyinlola**  
Email: [oluwayemioyinlola2@gmail.com](mailto:oluwayemioyinlola2@gmail.com)

---

<p align="center">
  Built with ❤️ to modernize African cooperative finance.
</p>
