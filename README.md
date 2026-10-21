# ADS - User Directory App

A full-stack web application built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS**, and **Prisma ORM** with **SQLite**.

---

## 🚀 Getting Started for New Team Members

Welcome to the team! Follow this step-by-step guide to get the project running locally on your machine for the first time.

### 1. Prerequisites

Make sure you have the following installed on your machine:

- **Node.js**: `v20.x` or later (LTS recommended) — verify with `node -v`
- **npm**: `v10.x` or later (bundled with Node.js) — verify with `npm -v`
- **Git**

---

### 2. First-Time Setup Instructions

#### Step 1: Clone the repository
```bash
git clone <repository-url>
cd ADS
```

#### Step 2: Install dependencies
Install project dependencies using `npm`:
```bash
npm install
```
> **Note:** A `postinstall` script runs automatically (`prisma skills sync`), which synchronizes agent/assistant skills configured in `prisma.config.ts`.

#### Step 3: Configure Environment Variables
Copy the template `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
By default, the `.env` file uses a local SQLite database:
```env
DATABASE_URL="file:./dev.db"
```
*(No external database service or cloud credentials required for local development!)*

#### Step 4: Initialize the Database
Run Prisma migrations to set up the local SQLite database and generate the Prisma Client:
```bash
npx prisma migrate dev
```
This command will:
- Create the local SQLite database file (`prisma/dev.db`) if it doesn't already exist.
- Apply all existing database migrations located in `prisma/migrations/`.
- Generate the latest type-safe `@prisma/client`.

#### Step 5: Start the Development Server
```bash
npm run dev
```

#### Step 6: Access the App
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

You should see the User Directory interface where you can create and view users.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack at `http://localhost:3000` |
| `npm run build` | Builds the application for production |
| `npm run start` | Runs the compiled production build |
| `npm run lint` | Runs ESLint to check for code quality and style issues |
| `npx prisma studio` | Opens an interactive web GUI at `http://localhost:5555` to inspect and edit database records |
| `npx prisma migrate dev` | Applies new or pending database migrations and updates Prisma Client |
| `npx prisma generate` | Regenerates Prisma Client types (useful after schema updates) |

---

## 📂 Project Structure

```text
ADS/
├── prisma/
│   ├── migrations/        # SQL migration history
│   ├── dev.db             # Local SQLite database (generated, git-ignored)
│   └── schema.prisma      # Prisma schema definition (User model, SQLite datasource)
├── src/
│   ├── app/
│   │   ├── actions.ts     # Next.js Server Actions (e.g., createUser)
│   │   ├── globals.css    # Tailwind CSS and global styling
│   │   ├── layout.tsx     # Root layout component
│   │   └── page.tsx       # Main page: User directory list & creation form
│   └── lib/
│       └── prisma.ts      # Singleton PrismaClient instance
├── .env.example           # Sample environment variable template
├── prisma.config.ts       # Prisma CLI configuration & agent skills sync
├── package.json           # Project dependencies and npm scripts
└── tsconfig.json          # TypeScript compiler configuration
```

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Data Flow**: Next.js Server Actions (`'use server'`) with `revalidatePath`

---

## ❓ Troubleshooting & FAQs

### Prisma Client Type Mismatches or "PrismaClientInitializationError"
If you encounter issues where Prisma types appear missing or stale:
```bash
npx prisma generate
```

### Resetting the Database
To reset your local development database to a clean state with fresh migrations:
```bash
npx prisma migrate reset
```
*(Warning: This will clear all data in your local `dev.db` file.)*

### Port 3000 is Already in Use
If port 3000 is occupied by another service:
```bash
npm run dev -- -p 3001
```
Then visit `http://localhost:3001`.
