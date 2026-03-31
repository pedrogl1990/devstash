# DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all developer knowledge & resources.**

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Target Users](#target-users)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Data Models (Prisma)](#data-models-prisma)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Features](#features)
- [Item Types & Theming](#item-types--theming)
- [URL Structure](#url-structure)
- [UI/UX Guidelines](#uiux-guidelines)
- [Monetization](#monetization)
- [Authentication](#authentication)
- [AI Integration](#ai-integration)
- [Key Links & Resources](#key-links--resources)

---

## Problem Statement

Developers keep their essentials scattered across too many tools:

| What                  | Where it ends up              |
| --------------------- | ----------------------------- |
| Code snippets         | VS Code, Notion, Gists       |
| AI prompts            | Chat histories                |
| Context files         | Buried in project directories |
| Useful links          | Browser bookmarks             |
| Documentation         | Random folders                |
| Terminal commands      | `.bash_history`, `.txt` files |
| Project templates     | GitHub Gists                  |

**Result:** context switching, lost knowledge, inconsistent workflows.

**DevStash** consolidates everything into a single, fast, searchable, developer-focused hub.

---

## Target Users

| Persona                      | Primary Need                                          |
| ---------------------------- | ----------------------------------------------------- |
| **Everyday Developer**       | Quick access to snippets, prompts, commands, and links |
| **AI-first Developer**       | Save and organize prompts, contexts, system messages   |
| **Content Creator/Educator** | Store code blocks, explanations, and course notes      |
| **Full-stack Builder**       | Collect patterns, boilerplates, and API examples       |

---

## Tech Stack

| Layer              | Technology                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) / [React 19](https://react.dev/)        |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                              |
| **Database**       | [Neon PostgreSQL](https://neon.tech/) (serverless)                         |
| **ORM**            | [Prisma 7](https://www.prisma.io/docs)                                     |
| **Authentication** | [NextAuth v5 (Auth.js)](https://authjs.dev/)                               |
| **File Storage**   | [Cloudflare R2](https://developers.cloudflare.com/r2/)                     |
| **AI**             | [OpenAI gpt-5-nano](https://platform.openai.com/docs)                     |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Caching**        | Redis (future consideration)                                               |

### Key Conventions

- SSR pages with dynamic client components where needed
- API routes for backend operations (items CRUD, file uploads, AI calls)
- Single codebase / monorepo — no separate backend
- **Database migrations only** — never use `db push` or modify the schema directly. Create migrations for dev and production.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│  Next.js 16 (React 19) · Tailwind v4 · shadcn/ui       │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌──────────┐
   │  SSR Pages │ │   API   │ │ Auth.js  │
   │  (RSC)     │ │ Routes  │ │ (v5)     │
   └────────────┘ └────┬────┘ └──────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌──────────┐
   │   Prisma   │ │  OpenAI │ │   R2     │
   │   (Neon)   │ │  API    │ │  Storage │
   └────────────┘ └─────────┘ └──────────┘
```

---

## Data Models (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── User ──────────────────────────────────────────────

model User {
  id                   String    @id @default(cuid())
  name                 String?
  email                String?   @unique
  emailVerified        DateTime?
  image                String?
  isPro                Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Items ─────────────────────────────────────────────

model Item {
  id          String  @id @default(cuid())
  title       String
  contentType String  // "text" | "url" | "file"
  content     String? // text/markdown content (null if file)
  fileUrl     String? // Cloudflare R2 URL (null if text)
  fileName    String? // original filename (null if text)
  fileSize    Int?    // bytes (null if text)
  url         String? // for link types
  description String?
  language    String? // programming language (optional, for code)
  isFavorite  Boolean @default(false)
  isPinned    Boolean @default(false)

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  collections ItemCollection[]
  tags        ItemTag[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([itemTypeId])
}

// ─── Item Types ────────────────────────────────────────

model ItemType {
  id       String  @id @default(cuid())
  name     String  // "snippet", "prompt", "note", etc.
  icon     String  // Lucide icon name
  color    String  // hex color
  isSystem Boolean @default(false)

  userId String? // null for system types
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items Item[]

  @@unique([name, userId])
}

// ─── Collections ───────────────────────────────────────

model Collection {
  id            String  @id @default(cuid())
  name          String  // "React Hooks", "Context Files"
  description   String?
  isFavorite    Boolean @default(false)
  defaultTypeId String? // default item type for empty collections

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items ItemCollection[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

// ─── Join Tables ───────────────────────────────────────

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

// ─── Tags ──────────────────────────────────────────────

model Tag {
  id   String @id @default(cuid())
  name String @unique

  items ItemTag[]
}

model ItemTag {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

---

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌────────────┐
│   User   │──1:N──│     Item     │──N:M──│ Collection │
└──────────┘       └──────────────┘       └────────────┘
     │                    │                      │
     │ 1:N                │ N:1                  │
     ▼                    ▼                      │
┌──────────┐       ┌──────────────┐              │
│ ItemType │──1:N──│   (typed)    │              │
└──────────┘       └──────────────┘              │
                          │                      │
                          │ N:M          (via ItemCollection)
                          │                      │
                          ▼                      │
                   ┌──────────────┐              │
                   │     Tag      │──────────────┘
                   └──────────────┘
                    (via ItemTag)

Relationships:
  User       → Item         (1:N)  A user owns many items
  User       → Collection   (1:N)  A user owns many collections
  User       → ItemType     (1:N)  A user can create custom types
  Item       → ItemType     (N:1)  Each item has one type
  Item      ↔ Collection   (N:M)  Via ItemCollection join table
  Item      ↔ Tag          (N:M)  Via ItemTag join table
  ItemType   → User         (N:1)  Null userId = system type
```

---

## Features

### A. Items & Item Types

Items are the core unit of DevStash. Each item has a **type** that determines its behavior, icon, and color. Users can create custom types (Pro), but the app ships with system types that cannot be modified.

Content categories by type:

- **Text-based** (`contentType: "text"`): Snippet, Prompt, Note, Command
- **URL-based** (`contentType: "url"`): Link
- **File-based** (`contentType: "file"`, Pro only): File, Image

Items are created and viewed via a **slide-out drawer** for fast access.

### B. Collections

Collections are user-created groups that can hold items of **any type**. Items can belong to **multiple collections** simultaneously.

Examples: "React Patterns" (snippets + notes), "Interview Prep" (snippets + prompts), "Context Files" (files)

### C. Search

Full-text search across item content, titles, tags, and types. Pro users get AI-enhanced search.

### D. Core Features

- Favorite collections and items (star toggle)
- Pin items to top of lists
- Recently used items section
- Import code from file upload
- Markdown editor for text-based types
- File upload for file/image types (R2 storage)
- Export data as JSON/ZIP (Pro)
- Dark mode default, light mode toggle
- Add/remove items to/from multiple collections at once
- View which collections an item belongs to

### E. AI Features (Pro Only)

| Feature                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| **AI Auto-tag**        | Suggests relevant tags based on item content       |
| **AI Summaries**       | Generates concise summaries of long content         |
| **AI Explain Code**    | Provides plain-English explanations of code blocks |
| **Prompt Optimizer**   | Rewrites and improves AI prompts                    |

---

## Item Types & Theming

System types ship with the app and cannot be deleted or renamed.

| Type        | Content Type | Color                       | Lucide Icon   | Pro Only |
| ----------- | ------------ | --------------------------- | ------------- | -------- |
| `snippet`   | `text`       | `#3b82f6` (Blue)            | `Code`        | No       |
| `prompt`    | `text`       | `#8b5cf6` (Purple)          | `Sparkles`    | No       |
| `command`   | `text`       | `#f97316` (Orange)          | `Terminal`    | No       |
| `note`      | `text`       | `#fde047` (Yellow)          | `StickyNote`  | No       |
| `link`      | `url`        | `#10b981` (Emerald)         | `Link`        | No       |
| `file`      | `file`       | `#6b7280` (Gray)            | `File`        | Yes      |
| `image`     | `file`       | `#ec4899` (Pink)            | `Image`       | Yes      |

### Seed Data

```ts
// prisma/seed.ts
const systemTypes = [
  { name: "snippet",  icon: "Code",       color: "#3b82f6", isSystem: true },
  { name: "prompt",   icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
  { name: "command",  icon: "Terminal",    color: "#f97316", isSystem: true },
  { name: "note",     icon: "StickyNote",  color: "#fde047", isSystem: true },
  { name: "link",     icon: "Link",        color: "#10b981", isSystem: true },
  { name: "file",     icon: "File",        color: "#6b7280", isSystem: true },
  { name: "image",    icon: "Image",       color: "#ec4899", isSystem: true },
];
```

---

## URL Structure

```
/                          → Dashboard (recent items, pinned, favorites)
/items/snippets            → All snippets
/items/prompts             → All prompts
/items/commands            → All commands
/items/notes               → All notes
/items/links               → All links
/items/files               → All files (Pro)
/items/images              → All images (Pro)
/collections               → All collections
/collections/[id]          → Single collection view
/search                    → Search results
/settings                  → User settings & account
/settings/billing          → Subscription management
```

---

## UI/UX Guidelines

### Design Principles

- Modern, minimal, developer-focused aesthetic
- Dark mode by default, light mode optional
- Clean typography with generous whitespace
- Subtle borders and shadows — no heavy decoration
- Syntax highlighting for all code blocks
- **Design references:** Notion, Linear, Raycast

### Layout

```
┌──────────────────────────────────────────────────┐
│  ┌────────────┐  ┌─────────────────────────────┐ │
│  │            │  │                             │ │
│  │  Sidebar   │  │       Main Content          │ │
│  │            │  │                             │ │
│  │  - Types   │  │  Collection cards (grid)    │ │
│  │  - Recent  │  │  Color-coded by dominant    │ │
│  │    Colls   │  │  item type (bg color)       │ │
│  │            │  │                             │ │
│  │            │  │  Item cards (grid)           │ │
│  │            │  │  Color-coded (border color)  │ │
│  │            │  │                             │ │
│  └────────────┘  └─────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- **Sidebar** (collapsible): Item type navigation links, latest collections
- **Main area**: Grid of collection cards and item cards
- **Collection cards**: Background color derived from dominant item type
- **Item cards**: Border color matches item type
- **Item detail**: Opens in a slide-out drawer (not a full page)
- **Mobile**: Sidebar collapses into a hamburger drawer

### Micro-interactions

- Smooth transitions on navigation and drawer open/close
- Hover states on all interactive cards
- Toast notifications for CRUD actions
- Loading skeletons while data fetches

---

## Monetization

### Plan Comparison

| Feature                        | Free             | Pro ($8/mo · $72/yr) |
| ------------------------------ | ---------------- | -------------------- |
| Items                          | 50 total         | Unlimited            |
| Collections                    | 3                | Unlimited            |
| System types (text + url)      | ✓                | ✓                    |
| File & Image types             | ✗                | ✓                    |
| Custom types                   | ✗                | ✓ (future)           |
| Basic search                   | ✓                | ✓                    |
| File/Image uploads (R2)        | ✗                | ✓                    |
| AI auto-tagging                | ✗                | ✓                    |
| AI code explanation            | ✗                | ✓                    |
| AI prompt optimizer            | ✗                | ✓                    |
| AI summaries                   | ✗                | ✓                    |
| Export (JSON/ZIP)              | ✗                | ✓                    |
| Priority support               | ✗                | ✓                    |

> **Dev note:** During development, all users have access to all features. Pro gating will be enforced before launch. The `isPro` flag and Stripe fields on the User model lay the foundation.

---

## Authentication

Powered by **Auth.js v5** (NextAuth).

### Providers

- **Credentials** — Email + password
- **GitHub OAuth** — One-click sign-in

### Auth Flow

```
User → Sign In Page → Auth.js → Provider Check
                                      │
                        ┌─────────────┼─────────────┐
                        ▼                           ▼
                  Credentials                  GitHub OAuth
                  (email/pw)                   (redirect)
                        │                           │
                        └─────────────┬─────────────┘
                                      ▼
                               Session Created
                              (JWT or Database)
                                      │
                                      ▼
                              Redirect to Dashboard
```

---

## AI Integration

**Model:** OpenAI `gpt-5-nano` (cost-effective for utility features)

### Feature Implementations

| Feature              | Trigger                | Input                    | Output               |
| -------------------- | ---------------------- | ------------------------ | --------------------- |
| Auto-tag             | On item save           | Item title + content     | Array of tag strings   |
| Summarize            | User action button     | Item content             | 2–3 sentence summary   |
| Explain Code         | User action button     | Code snippet + language  | Plain-English breakdown |
| Prompt Optimizer     | User action button     | Raw prompt text          | Improved prompt text    |

All AI calls go through Next.js API routes to keep the OpenAI key server-side.

---

## Key Links & Resources

| Resource                   | URL                                                     |
| -------------------------- | ------------------------------------------------------- |
| Next.js 16 Docs            | https://nextjs.org/docs                                 |
| React 19 Docs              | https://react.dev                                       |
| Prisma 7 Docs              | https://www.prisma.io/docs                              |
| Auth.js (NextAuth v5)      | https://authjs.dev                                      |
| Neon PostgreSQL             | https://neon.tech/docs                                  |
| Cloudflare R2              | https://developers.cloudflare.com/r2                    |
| Tailwind CSS v4            | https://tailwindcss.com/docs                            |
| shadcn/ui                  | https://ui.shadcn.com                                   |
| OpenAI API                 | https://platform.openai.com/docs                        |
| Stripe Billing             | https://docs.stripe.com/billing                         |
| Lucide Icons               | https://lucide.dev/icons                                |
