# LinkConn Rent 🏠

> A modern, full-stack property rental platform built with Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma, and Clerk Authentication.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2d3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Scripts](#scripts)
- [Routing Architecture](#routing-architecture)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

LinkConn Rent is a full-featured property rental marketplace that connects landlords and tenants. It provides seamless property listing, browsing, search, and secure authentication with a multi-step onboarding flow for both landlords and tenants.

---

## ✨ Features

- 🔐 **Authentication** — Powered by Clerk with email/password and OAuth support
- 🏘️ **Property Listings** — Rich property detail pages with image galleries
- 🔍 **Search & Filter** — Location, price range, and property type filtering
- 🧙 **Multi-step Onboarding** — Role-based onboarding (landlord / tenant)
- 💳 **Pricing Plans** — Tiered plans for landlords
- 📧 **Email Verification** — Custom email verification flow
- 📱 **Responsive Design** — Mobile-first UI with Framer Motion animations
- ⚡ **Streaming & Suspense** — Next.js loading.tsx convention for all routes
- 🛡️ **Protected Routes** — Middleware-based route protection

---

## 🛠️ Tech Stack

| Category        | Technology                       |
|-----------------|----------------------------------|
| Framework       | Next.js 15 (App Router)          |
| Language        | TypeScript 5.7                   |
| Styling         | Tailwind CSS 4.0                 |
| Animation       | Framer Motion 12                 |
| Authentication  | Clerk                            |
| Database ORM    | Prisma 6.4                       |
| Database        | PostgreSQL (Neon)                |
| Validation      | Zod 3.24                         |
| Icons           | Lucide React                     |
| Deployment      | Vercel                           |
| Package Manager | pnpm (recommended) / npm         |

---

## 📁 Project Structure

```
linkconn-rent/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   ├── signup/
│   │   ├── onboarding/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify/
│   │   └── verify-email/
│   ├── (dashboard)/            # Protected dashboard routes
│   │   └── dashboard/
│   ├── (public)/               # Public-facing routes
│   │   ├── properties/
│   │   │   └── [id]/           # Dynamic property detail
│   │   ├── how-it-works/
│   │   ├── pricing/
│   │   └── trust-and-safety/
│   ├── api/                    # Route Handlers
│   │   └── auth/
│   ├── layout.tsx              # Root layout
│   └── globals.css
├── components/                 # Reusable UI components
│   ├── auth/
│   ├── sections/
│   └── ui/
├── features/                   # Feature-sliced modules
│   └── onboarding/
├── hooks/                      # Custom React hooks
├── lib/                        # Shared utilities & config
├── providers/                  # React context providers
├── repositories/               # Data access layer
├── schemas/                    # Zod validation schemas
├── domain/                     # Domain constants & types
├── utils/                      # Utility functions
├── scripts/                    # DB seed & admin scripts
├── tests/                      # Test suites
├── prisma/                     # Prisma schema & migrations
│   └── schema.prisma
├── public/                     # Static assets
├── middleware.ts               # Route protection middleware
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL database (or [Neon](https://neon.tech) serverless)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/linkconn-rent.git
cd linkconn-rent

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Generate Prisma client
pnpm prisma:generate

# Push database schema
pnpm prisma:db-push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Database Setup

```bash
# Generate Prisma Client
pnpm prisma:generate

# Push schema to database
pnpm prisma:db-push

# Seed the database
pnpm db:seed

# Open Prisma Studio (GUI)
pnpm prisma:studio
```

---

## 📜 Scripts

| Script               | Description                          |
|----------------------|--------------------------------------|
| `pnpm dev`           | Start development server             |
| `pnpm build`         | Build for production                 |
| `pnpm start`         | Start production server              |
| `pnpm lint`          | Run ESLint                           |
| `pnpm prisma:generate` | Generate Prisma client             |
| `pnpm prisma:db-push`  | Push schema to database            |
| `pnpm prisma:studio`   | Open Prisma Studio                 |
| `pnpm db:seed`       | Seed the database                    |

---

## 🗺️ Routing Architecture

LinkConn Rent uses **Next.js 15 App Router** with route groups for clean separation:

| Route Group       | Purpose                     | Auth Required |
|-------------------|-----------------------------|---------------|
| `(public)`        | Marketing & browsing pages  | ❌ No         |
| `(auth)`          | Login, signup, onboarding   | ❌ No         |
| `(dashboard)`     | User dashboard              | ✅ Yes        |

### Key Routes

| Path                     | Description                  |
|--------------------------|------------------------------|
| `/`                      | Home / landing page          |
| `/properties`            | Property listings             |
| `/properties/[id]`       | Property detail page          |
| `/how-it-works`          | How it works page             |
| `/pricing`               | Pricing plans                 |
| `/trust-and-safety`      | Trust & safety page           |
| `/login`                 | Login page                    |
| `/signup`                | Sign up page                  |
| `/onboarding`            | Multi-step onboarding         |
| `/dashboard`             | User dashboard                |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

*Built with ❤️ by the LinkConn team.*
