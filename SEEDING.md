# Database Seeding Guide

This project contains multiple seeding mechanisms for different database backends. Use this guide to understand when to use each.

## Available Seeding Scripts

### 1. Prisma Seed (`pages/api/dev/seed.ts`)

**Use when**: Working with PostgreSQL via Prisma ORM (current production setup)

**How to run**:
```bash
# Via API endpoint (development only)
curl http://localhost:3000/api/dev/seed
```

**What it does**:
- Deletes all existing lessons (cascades to progress)
- Seeds 4 sample lessons using Prisma client
- Creates lessons with phonetic, dialogue, and list content types
- Only runs in `NODE_ENV !== 'production'`

**Database**: PostgreSQL (via Prisma)

---

### 2. Convex Seed (`convex/seed.ts`)

**Use when**: Migrating to or testing Convex backend

**How to run**:
```bash
# Using Convex CLI
npx convex run seed:seedData
```

**What it does**:
- Seeds user profiles, lessons, and initial progress data
- Creates sample admin user
- Uses Convex mutations for data insertion
- Designed for Convex real-time database

**Database**: Convex

---

## Migration Status

> [!IMPORTANT]
> **Current State**: The project is in migration from Supabase/Prisma to Auth0 + Convex
> 
> - **Authentication**: Migrating to Auth0 (removing Supabase Auth)
> - **Database**: Migrating to Convex (removing PostgreSQL/Prisma)
> - **Client Queries**: Will use Convex hooks

### During Migration

- Use **Prisma seed** for current production data
- Use **Convex seed** for testing migrated features
- Do NOT use both in the same environment

---

## Mock Data Fallback

The application also contains `lib/data/lessons.ts` with `MOCK_LESSONS` used as a fallback when database connections fail. This is intentionally kept for development resilience.

**Development endpoint**: `/api/dev/lessons/[id]` returns mock data with artificial 500ms delay for testing loading states.

---

## Cleanup Plan

Once migration to Auth0 + Convex is complete:

1. ✅ Remove `pages/api/dev/seed.ts` (Prisma seeding)
2. ✅ Remove Supabase dependencies from `package.json`
3. ✅ Remove `lib/supabase.ts`
4. ✅ Keep `MOCK_LESSONS` for development fallback (optional)
5. ✅ Update this document to remove Prisma references
