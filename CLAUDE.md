# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 + Supabase authentication starter template using TypeScript, Tailwind CSS v4, and server actions. The project demonstrates a complete authentication flow with email/password auth, protected routes, and session management.

## Essential Commands

```bash
# Development
bun dev          # Run development server with turbopack (port 3000)
npm run dev      # Alternative with npm

# Build & Production
bun build        # Create production build
bun start        # Run production server
npm run build    # Alternative with npm
npm start        # Alternative with npm

# Code Quality
bun lint         # Run Next.js linter
npm run lint     # Alternative with npm
```

## Architecture Overview

### Authentication Flow
1. **Supabase Clients** (`/utils/supabase/`)
   - `client.ts`: Browser-side client using `createBrowserClient`
   - `server.ts`: Server-side client with cookie management
   - `middleware.ts`: Session refresh logic with `updateSession`

2. **Middleware** (`middleware.ts`)
   - Intercepts all requests except static assets
   - Calls `updateSession` to refresh auth tokens
   - Redirects unauthenticated users to `/login` for protected routes

3. **Server Actions** (`app/login/actions.ts`)
   - `login()`: Handles sign-in with email/password
   - `signup()`: Handles new user registration
   - Both redirect to `/dashboard` on success, `/error` on failure

4. **Route Handlers**
   - `/auth/confirm/route.ts`: Handles email confirmation callbacks
   - `/auth/signout/route.ts`: Clears session and redirects to login

### Protected Routes Pattern
Server components check authentication by:
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### Environment Configuration
Required variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key

### Key Dependencies
- `@supabase/ssr`: Server-side rendering support for Supabase
- `@supabase/supabase-js`: Core Supabase client
- Next.js 15 with App Router
- Tailwind CSS v4 (using PostCSS)

## Important Supabase Configuration

When setting up a new Supabase project:
1. Enable Email provider in Authentication → Providers
2. Add redirect URLs in Authentication → URL Configuration:
   - `http://localhost:3000/auth/confirm`
   - Production URLs when deploying

## Testing Authentication Flow

1. Sign up creates user via Supabase (sends confirmation email by default)
2. Email confirmation redirects to `/auth/confirm` then `/dashboard`
3. Direct sign-in redirects to `/dashboard`
4. Accessing protected routes while logged out redirects to `/login`
5. Sign out clears session and redirects to `/login`