# SMTP Agent — Frontend Dashboard

Modern, centralized administration and email dispatch studio for **SMTP Agent Backend** (`backend-smtp`). Built with **Vue 3**, **Tailwind CSS v4**, **TypeScript**, and containerized with **Docker** for zero local tool dependencies.

---

## ⚡ Quick Start (No Node.js Required)

Semua dependensi dan Vite dev server berjalan langsung di dalam Docker container:

```bash
# 1. Jalankan development server dengan Hot Module Replacement (HMR)
docker compose up --build
```

Buka di browser:
👉 **[http://localhost:5173](http://localhost:5173)**

Untuk menjalankan versi production (Nginx):
```bash
docker compose --profile prod up --build frontend-prod
```
Buka di browser:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🚀 Fitur Utama

- **Real-Time Health Monitoring (`GET /health`)**:
  - Live status indicator (Online / Offline / Latency ms) untuk server backend Go.
- **Manajemen Konfigurasi SMTP (`/api/v1/smtp-configs`)**:
  - Tambah, Edit, Hapus, dan Filter server SMTP.
  - Preset instan untuk provider populer: **Gmail**, **Mailtrap**, **SendGrid**, **Amazon SES**, dan **Local MailHog**.
  - Toggle atomik **Default SMTP Mailer** (`PUT /api/v1/smtp-configs/{id}/default`).
  - Active **Diagnostic Ping Test** (`POST /api/v1/smtp-configs/{id}/test`) untuk menguji handshake socket & otentikasi tanpa harus mengirim email nyata.
- **Email Dispatch Studio (`POST /api/v1/emails/send`)**:
  - Dukungan multi-recipients (`to`, `cc`, `bcc`) dengan chip email interaktif dan validasi format.
  - Switcher konten Plain Text vs Rich HTML dengan **Live HTML Preview**.
  - Drag-and-drop file uploader dengan konversi otomatis ke payload Base64 `AttachmentDTO`.
  - Dukungan routing via ID konfigurasi tertentu atau otomatis menggunakan Default Mailer.
  - JSON Payload Inspector untuk mempermudah integrasi microservice.
- **Connection & Security Settings**:
  - Konfigurasi URL backend dinamis (default: `http://localhost:8082`).
  - Manajemen header `X-API-Key` dengan opsi show/hide password.
- **Design & UX**:
  - Tema Obsidian Dark / Modern Light dengan glassmorphism.
  - Tipografi Inter & JetBrains Mono.
  - Responsif untuk desktop, tablet, dan smartphone.

---

## 📂 Struktur Proyek

```
frontend-smtp/
├── Dockerfile                   # Multi-stage Dockerfile (dev & prod Nginx)
├── docker-compose.yml           # One-command orchestration
├── nginx.conf                   # Konfigurasi SPA production Nginx
├── index.html                   # HTML5 Entrypoint
├── package.json                 # Vue 3, Tailwind 4, TypeScript dependencies
├── vite.config.ts               # Vite configuration (@tailwindcss/vite)
├── tsconfig.json                # Strict TypeScript configuration
└── src/
    ├── assets/
    │   └── main.css             # Tailwind v4 @import dan custom theme tokens
    ├── components/
    │   ├── layout/
    │   │   ├── AppNavbar.vue    # Topbar dengan status backend & quick actions
    │   │   └── AppSidebar.vue   # Navigasi utama
    │   ├── smtp/
    │   │   ├── SmtpFormModal.vue      # Form modal Tambah/Edit dengan preset
    │   │   └── SmtpTestPingModal.vue  # Modal diagnostic ping test
    │   └── email/
    │       ├── RecipientInput.vue     # Input multi-email chip tags
    │       └── AttachmentUploader.vue # Uploader file ke Base64
    ├── composables/
    │   └── useTheme.ts          # Dark / Light theme manager
    ├── router/
    │   └── index.ts             # Vue Router
    ├── stores/
    │   ├── config.ts            # Pinia store untuk setting URL & API Key
    │   ├── smtp.ts              # Pinia store untuk CRUD & test SMTP
    │   └── email.ts             # Pinia store untuk dispatch & history
    ├── types/
    │   └── api.ts               # TypeScript interfaces DTO backend
    ├── utils/
    │   ├── api.ts               # Client HTTP native Fetch
    │   └── formatters.ts        # Format tanggal, latency, dan ukuran file
    ├── views/
    │   ├── DashboardView.vue    # Ringkasan sistem & statistik
    │   ├── SmtpConfigsView.vue  # Tabel konfigurasi SMTP & aksi
    │   ├── SendEmailView.vue    # Studio pengiriman email
    │   └── SettingsView.vue     # Pengaturan koneksi API
    ├── App.vue
    └── main.ts
```
