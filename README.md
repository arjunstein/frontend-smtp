# SMTP Agent — Frontend Dashboard

Modern, centralized administration and email dispatch studio for **SMTP Agent Backend** (`backend-smtp`). Built with **Vue 3**, **Tailwind CSS v4**, **TypeScript**, and containerized with **Docker** for zero local tool dependencies.

---

## ⚡ Quick Start (No Node.js Required)

All dependencies and the Vite dev server run directly inside Docker containers:

```bash
# 1. Setup local environment file (optional, defaults to http://localhost:8082)
cp .env.example .env

# 2. Start development server with Hot Module Replacement (HMR)
docker compose up --build
```

Open in your browser:
👉 **[http://localhost:5173](http://localhost:5173)**

To run the production-optimized build served with Nginx:
```bash
docker compose --profile prod up --build frontend-prod
```
Open in your browser:
👉 **[http://localhost:3000](http://localhost:3000)**


---

## 🚀 Key Features

- **Real-Time Health Monitoring (`GET /health`)**:
  - Live status indicator (Online / Offline / Latency ms) for the Go backend service.
- **SMTP Configuration Management (`/api/v1/smtp-configs`)**:
  - Create, Read, Update, Delete (CRUD), and real-time filtering for SMTP accounts.
  - Instant server presets: **Gmail**, **Mailtrap**, **SendGrid**, **Amazon SES**, and **Local MailHog**.
  - Atomic default mailer toggle (`PUT /api/v1/smtp-configs/{id}/default`).
  - Active **Diagnostic Ping Test** (`POST /api/v1/smtp-configs/{id}/test`) to verify socket handshake and authentication without sending test emails.
- **Email Dispatch Studio (`POST /api/v1/emails/send`)**:
  - Multi-recipient inputs (`to`, `cc`, `bcc`) with interactive tag chips and address format validation.
  - Plain Text vs. Rich HTML mode with **Live HTML Preview**.
  - Drag-and-drop file uploader with automatic Base64 encoding into `AttachmentDTO` structure.
  - Flexible routing: dispatch through a specific configuration ID or fall back to the system default.
  - Real-time JSON Payload Inspector to assist external microservice integrations.
- **Connection & Security Settings**:
  - Dynamic backend URL configuration (default: `http://localhost:8082`).
  - `X-API-Key` management with password mask toggle.
- **Design & UX**:
  - Obsidian Dark and Modern Light themes with glassmorphism effects.
  - Curated typography with Inter and JetBrains Mono fonts.
  - Fully responsive across desktop, tablet, and mobile displays.

---

## 📂 Project Structure

```
frontend-smtp/
├── .env.example                 # Environment variables template
├── Dockerfile                   # Multi-stage Dockerfile (dev & prod Nginx)
├── docker-compose.yml           # One-command orchestration
├── nginx.conf                   # Production SPA Nginx configuration
├── index.html                   # HTML5 Entrypoint
├── package.json                 # Vue 3, Tailwind 4, TypeScript dependencies
├── vite.config.ts               # Vite configuration (@tailwindcss/vite)
├── tsconfig.json                # Strict TypeScript configuration
└── src/
    ├── assets/
    │   └── main.css             # Tailwind v4 @import and custom design tokens
    ├── components/
    │   ├── layout/
    │   │   ├── AppNavbar.vue    # Topbar with backend health status & quick actions
    │   │   └── AppSidebar.vue   # Main navigation sidebar
    │   ├── smtp/
    │   │   ├── SmtpFormModal.vue      # Add/Edit modal with server presets
    │   │   └── SmtpTestPingModal.vue  # Diagnostic ping test modal
    │   └── email/
    │       ├── RecipientInput.vue     # Multi-email chip tag input
    │       └── AttachmentUploader.vue # Base64 attachment uploader
    ├── composables/
    │   └── useTheme.ts          # Dark/Light theme manager
    ├── router/
    │   └── index.ts             # Vue Router
    ├── stores/
    │   ├── config.ts            # Pinia store for backend URL & API Key
    │   ├── smtp.ts              # Pinia store for SMTP CRUD & tests
    │   └── email.ts             # Pinia store for email dispatch & history
    ├── types/
    │   └── api.ts               # TypeScript interfaces matching backend DTOs
    ├── utils/
    │   ├── api.ts               # Native Fetch HTTP client with error formatting
    │   └── formatters.ts        # Date, latency, and file size formatters
    ├── views/
    │   ├── DashboardView.vue    # System metrics & dispatch history
    │   ├── SmtpConfigsView.vue  # SMTP table, presets, and action triggers
    │   ├── SendEmailView.vue    # Centralized email dispatch studio
    │   └── SettingsView.vue     # Backend connection & security settings
    ├── App.vue
    └── main.ts
```
