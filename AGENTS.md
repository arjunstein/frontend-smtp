# Agent Guidelines for frontend-smtp

This document provides operational context, architecture boundaries, and verified commands for AI coding agents working on the `frontend-smtp` repository.

---

## 1. Project Overview & Tech Stack

`frontend-smtp` is the web administration console and email dispatch studio for the Go-based SMTP Agent backend (`backend-smtp`).

- **Framework**: Vue 3 (Composition API with `<script setup lang="ts">`)
- **Build Tool**: Vite 6 (`@vitejs/plugin-vue`, `@tailwindcss/vite`)
- **Styling**: Tailwind CSS v4 (configured via CSS `@import "tailwindcss";` in `src/assets/main.css`)
- **State Management**: Pinia 2 (`src/stores/`)
- **Routing**: Vue Router 4 (`src/router/index.ts`)
- **Icons**: `lucide-vue-next`
- **Language**: TypeScript 5 (Strict mode)
- **Containerization**: Multi-stage Docker (`node:22-alpine` builder, `nginx:alpine` production server)

---

## 2. Environment & Execution Context

### Zero-Host-Dependency Rule
The project is containerized so that Node.js is not required on the host system. Agents should prefer running checks inside the running Docker container or via Docker Compose whenever host node is absent.

- **Dev Server**: `http://localhost:5173` (container: `smtp_frontend_dev`, HMR enabled via volume mount)
- **Production Server**: `http://localhost:3000` (container: `smtp_frontend_prod`, Nginx SPA proxy)
- **Backend API**: `http://localhost:8082` (Go backend `backend-smtp`)

### Verified Commands

| Purpose | Host Command (if Node installed) | Docker Container Command |
| :--- | :--- | :--- |
| **Start Dev** | `npm run dev` | `docker compose up --build` |
| **Start Prod** | `npm run build && npm run preview` | `docker compose --profile prod up --build frontend-prod` |
| **Typecheck & Build** | `npm run build` | `docker exec smtp_frontend_dev npm run build` |
| **Rebuild Prod Container** | N/A | `docker compose up -d --build frontend-prod` |

---

## 3. Repository Structure & Key Boundaries

```
frontend-smtp/
├── .env.example                # Template for environment variables
├── Dockerfile                  # Multi-stage Dockerfile (dev, builder, prod)
├── docker-compose.yml          # Container orchestration (frontend & frontend-prod)
├── nginx.conf                  # Production SPA routing (try_files fallback)
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript project references & config
├── vite.config.ts              # Vite plugins & @ path alias
└── src/
    ├── assets/
    │   └── main.css            # Tailwind v4 import, color variables, glassmorphic tokens
    ├── components/
    │   ├── layout/
    │   │   ├── AppNavbar.vue   # Topbar with backend health ping, auth user pill & theme toggle
    │   │   └── AppSidebar.vue  # Main navigation links & default mailer summary
    │   ├── smtp/               # SMTP modals (add/edit presets, diagnostic ping test)
    │   └── email/              # Email studio widgets (tag input, Base64 uploader)
    ├── composables/
    │   └── useTheme.ts         # Dark/Light theme toggle persistence
    ├── router/
    │   └── index.ts            # Vue router with auth & guest navigation guards
    ├── stores/
    │   ├── auth.ts             # JWT token handling, login, register, me, session refresh
    │   ├── config.ts           # Backend URL & API Key management, health checks
    │   ├── email.ts            # Email dispatch form state & local dispatch history
    │   └── smtp.ts             # SMTP CRUD actions, active preset configs, ping tests
    ├── types/
    │   └── api.ts              # TypeScript DTOs matching backend JSON contracts
    ├── utils/
    │   ├── api.ts              # Native Fetch client, Bearer auth, automatic 401 refresh queue
    │   └── formatters.ts       # Date, byte size, and latency formatters
    ├── views/
    │   ├── DashboardView.vue   # System metrics & dispatch history table
    │   ├── LoginView.vue       # Dedicated Sign In console (standalone, no navbar)
    │   ├── SendEmailView.vue   # Email composer, live HTML preview, JSON payload inspector
    │   ├── SettingsView.vue    # Backend endpoint, API Key, connection testing
    │   └── SmtpConfigsView.vue # SMTP configurations table, presets & ping test modal
    ├── App.vue                 # Root layout (conditionally hides sidebar/navbar on auth pages)
    └── main.ts                 # App entry point (Pinia & Router registration)
```

---

## 4. Coding & Architecture Conventions

1. **Strict TypeScript & DTOs**:
   - Always update interfaces in [`src/types/api.ts`](file:///Users/arjungunawan/Documents/Projects/frontend-smtp/src/types/api.ts) before creating or updating store methods.
   - Types must mirror Go backend endpoints (`/api/v1/auth/*`, `/api/v1/smtp-configs/*`, `/api/v1/emails/send`, `/health`).

2. **HTTP Client & Authentication**:
   - Use `apiClient<T>()` from [`src/utils/api.ts`](file:///Users/arjungunawan/Documents/Projects/frontend-smtp/src/utils/api.ts) for all backend communication.
   - Do NOT use third-party HTTP clients like Axios; native fetch with typed responses is the standard.
   - Auth tokens (`access_token`, `refresh_token`) and user profiles are managed via `useAuthStore()` and stored in `localStorage`.
   - Automatic 401 retry queue is already wired into `apiClient()`.

3. **Routing & Route Protection**:
   - All protected console pages (`/`, `/configs`, `/send`, `/settings`) must specify `meta: { requiresAuth: true }`.
   - Guest pages (`/login`) must specify `meta: { guestOnly: true, isAuthPage: true }`.
   - When adding new auth pages, `isAuthPage` ensures navbar and sidebar are hidden automatically in `App.vue`.

4. **UI & Styling Standards**:
   - All user-facing text, notifications, error messages, and labels must be in **English**.
   - Use Tailwind CSS v4 utility classes and predefined design tokens (`bg-background`, `text-foreground`, `glass-card`, `border-border`).
   - Use `lucide-vue-next` for all iconography.

5. **Avoid Polluting the Workspace**:
   - Do not commit `.tsbuildinfo` files or build output directories (`dist/`).
   - Build artifacts are covered by `.gitignore`.

---

## 5. Git & Collaboration Safety Rules

- **Branching**: Perform all feature and fix work on the **`dev`** branch unless explicitly instructed to merge to `master`.
- **Destructive Commands**: Never execute `git push --force`, `git reset --hard`, `git clean -f`, or destructive removal without explicit user authorization.
- **Commit & Push Policy**: Do NOT commit or push to remote repositories without explicit user instruction.
- **Verification Before Handoff**: Always execute `npm run build` (or `docker exec smtp_frontend_dev npm run build`) to ensure type safety and error-free bundle generation before completing tasks.
