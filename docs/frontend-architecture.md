# Frontend Architecture

This document describes the frontend architecture of Kolo — a React 18 + TypeScript + Vite SPA built with feature-based organization.

---

## Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Framework | React 18.3 | UI rendering |
| Language | TypeScript 5 | Type safety |
| Build Tool | Vite 6 | Fast dev server and builds |
| Styling | Tailwind CSS 4 + Radix UI | Design system |
| Server State | TanStack Query 5 | API data caching and mutation |
| Client State | Zustand 5 | Auth, theme, global UI state |
| Routing | React Router 6 | SPA routing |
| Forms | React Hook Form + Zod 4 | Form validation |
| HTTP | Axios 1 | API communication |
| Icons | Lucide React + MUI Icons | UI icons |
| Charts | Recharts | Data visualization |

---

## Folder Structure

```
public/
├── src/
│   ├── app/               # App shell, providers, router, store
│   ├── api/               # Axios client with auth interceptor
│   ├── assets/            # Static assets
│   ├── components/        # Shared UI components
│   │   ├── ui/            # shadcn/ui primitives (48 components)
│   │   ├── shared/        # App-specific shared components
│   │   └── layout/        # Layout shells (AppLayout, AuthLayout)
│   ├── constants/         # Route constants
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Login, register, OTP, password reset
│   │   ├── landing/       # Public marketing pages
│   │   ├── admin/         # Super Admin dashboard (13 pages)
│   │   ├── group/         # Group Admin dashboard (10 pages)
│   │   ├── member/        # Member dashboard (9 pages)
│   │   └── ...            # Other features
│   ├── hooks/             # TanStack Query hooks (15 files)
│   ├── services/          # API service functions (13 files)
│   ├── styles/            # CSS: tailwind, theme, fonts, globals
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
└── index.html             # SPA shell
```

---

## Application Architecture

```mermaid
flowchart TB
    Entry["Entry Point (main.tsx)\ninitAuth() → createRoot → <App />"]
    App["App.tsx\n<AppProviders>\n<RouterProvider router={router}>"]
    Providers["AppProviders\nQueryClientProvider (TanStack Query)"]
    Router["Router (React Router 6)"]

    subgraph Public["Public Routes"]
        Landing["(/, /pricing, /about,\n/contact, /security, /help)"]
    end

    subgraph Auth["Auth Pages"]
        Login["/login, /register,\n/verify-otp, /forgot-password"]
    end

    subgraph Protected["Protected Routes"]
        SuperAdmin["Super Admin\n/ajo/admin/*"]
        GroupAdmin["Group Admin\n/group/admin/*"]
        Member["Member\n/member/*"]
    end

    subgraph Gate["Auth Gate"]
        ProtectedRoute["ProtectedRoute Component\nChecks: isHydrated, accessToken, role"]
    end

    Entry --> App
    App --> Providers
    Providers --> Router
    Router --> Public
    Router --> Auth
    Router --> Protected
    Protected --> ProtectedRoute
    ProtectedRoute --> SuperAdmin
    ProtectedRoute --> GroupAdmin
    ProtectedRoute --> Member
```

---

## Data Flow

```mermaid
flowchart TB
    Component["Component (Page)"]
    Hook["Custom Hook\nuseQuery / useMutation\n(TanStack Query)"]
    Service["Service Function\n(user.service.ts, payment.service.ts)"]
    Client["API Client (Axios)\nwithCredentials: true"]
    Backend["Backend API (Fastify - /api/v1/*)"]
    Cache["TanStack Query Cache\nAutomatic caching & invalidation"]
    ReRender["Component re-render"]

    Component --> Hook
    Hook --> Service
    Service -->|"Axios call"| Client
    Client -->|"HTTP request"| Backend
    Backend -->|"Response"| Client
    Client -->|"Response data"| Service
    Service -->|"Data"| Hook
    Hook -->|"Cached data"| Cache
    Cache -->|"Update"| Component
    Component --> ReRender

    subgraph Interceptors["Axios Interceptors"]
        ReqInt["Request Interceptor\nAttaches Bearer token"]
        ResInt["Response Interceptor\n401 → refresh token → retry"]
    end

    Client --> ReqInt
    Client --> ResInt
```

### The API Client

```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true,  // Sends HttpOnly cookies
});

// Request interceptor: attaches access token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handles token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Queue request, attempt refresh, retry
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## State Management

### Layer 1: TanStack Query (Server State)

All API data is cached by TanStack Query with automatic invalidation:

```typescript
// hooks/use-payments.ts
export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.getPaymentHistory(),
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentDto) => paymentService.initiatePayment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });
}
```

### Layer 2: Zustand (Client State)

Global client state for auth, theme, and UI:

```typescript
// app/store.ts
interface AppState {
  user: AuthUser | null;
  role: UserRole | null;
  accessToken: string | null;
  isHydrated: boolean;
  theme: ThemeMode;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
}
```

---

## Routing & Protected Routes

### Route Groups

| Group | Routes | Access |
|---|---|---|
| Public | `/`, `/pricing`, `/about`, `/contact`, etc. | Everyone |
| Auth | `/login`, `/register`, `/verify-otp` | Unauthenticated |
| Super Admin | `/ajo/admin/*` | `SUPER_ADMIN` |
| Group Admin | `/group/admin/*` | `GROUP_ADMIN`, `GROUP_OWNER` |
| Member | `/member/*` | `MEMBER`, `GROUP_ADMIN`, `SUPER_ADMIN` |

### ProtectedRoute Component

```typescript
function ProtectedRoute({ children, allowedRoles }) {
  const isHydrated = useAppStore(s => s.isHydrated);
  const accessToken = useAppStore(s => s.accessToken);
  const role = useAppStore(s => s.role);

  if (!isHydrated) return <Loading />;
  if (!accessToken) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleBasedDashboard(role)} />;
  }
  return children;
}
```

---

## Theming System

Kolo uses a CSS custom property-based theming system:

```css
/* Light mode */
:root {
  --primary: #065f46;
  --background: #ffffff;
  --card: #ffffff;
}

/* Dark mode */
.dark {
  --primary: #10b981;
  --background: #0a0f0d;
  --card: #111918;
}
```

Theme is toggled by adding/removing the `dark` class on `<html>` and persisted in localStorage.

---

## Layout Components

### AuthLayout (Login/Register pages)
```mermaid
flowchart TB
    subgraph AuthLayout["AuthLayout"]
        BrandPanel["Brand Panel\nLogo, Value Props, Testimonials"]
        FormPanel["Form Panel\nAuth Form, Submit Button, Links"]
    end

    BrandPanel ~~~ FormPanel
```

### AppLayout (Admin Dashboards)
```mermaid
flowchart TB
    subgraph AppLayout["AppLayout"]
        Sidebar["Sidebar\nNavigation Items"]
        Right["Right Panel"]
        Header["Header\nSearch | Theme Toggle | User Menu"]
        Content["Main Content Area\n(Page content rendered by Outlet)"]
    end

    Sidebar --> Right
    Right --> Header
    Right --> Content
```

### MemberApp (Mobile-first)
```mermaid
flowchart TB
    subgraph MemberApp["MemberApp"]
        Title["Header / Title"]
        Main["Main Content Area"]
        BottomNav["Bottom Navigation\nHome | Groups | Pay | History | Profile"]
    end

    Title --> Main
    Main --> BottomNav
```

---

## InitAuth Flow

On page load, `initAuth()` attempts to restore the session:

```mermaid
flowchart TB
    Start["Page Load (main.tsx)"]
    Init["initAuth()"]
    Refresh["POST /auth/refresh\n(HttpOnly cookie sent automatically)"]
    Success{"Success?"}
    Extract["Extract new access token\nfrom response"]
    Profile["GET /auth/me\n(fetch user profile)"]
    SetSession["setSession(profile, token)\nset isHydrated = true"]
    Clear["clearSession()\nset isHydrated = true"]
    Hydrated{"isHydrated?"}
    Loading["Loading Spinner"]
    Render["Normal App Render"]

    Start --> Init
    Init --> Refresh
    Refresh --> Success
    Success -->|"Yes"| Extract
    Extract --> Profile
    Profile --> SetSession
    Success -->|"No"| Clear
    SetSession --> Hydrated
    Clear --> Hydrated
    Hydrated -->|"false"| Loading
    Hydrated -->|"true"| Render
```
