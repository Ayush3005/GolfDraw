# GolfDraw Project Structure

## Project Overview
GolfDraw is a premium golf subscription platform where passionate golfers compete in monthly draws to win prizes while supporting charities.

## Folder Structure

```
/src
├── /app                          # Next.js App Router
│   ├── (auth)                    # Authentication routes (route group)
│   │   ├── /login                # Login page
│   │   ├── /signup               # Signup page
│   │   └── layout.tsx            # Auth layout
│   ├── (public)                  # Public routes (route group)
│   │   ├── /charities            # Charities listing page
│   │   ├── layout.tsx            # Public layout with navbar/footer
│   │   └── page.tsx              # Landing page
│   ├── (user)                    # User protected routes (route group)
│   │   ├── /dashboard            # User dashboard
│   │   ├── /scores               # Scores tracking
│   │   ├── /charity              # Charity selection
│   │   └── layout.tsx            # User layout with sidebar
│   ├── (admin)                   # Admin protected routes (route group)
│   │   ├── /admin                # Admin dashboard
│   │   ├── /admin/users          # User management
│   │   ├── /admin/draws          # Draw management
│   │   ├── /admin/charities      # Charity management
│   │   ├── /admin/winners        # Winner management
│   │   └── layout.tsx            # Admin layout with sidebar
│   ├── /api                      # API routes
│   │   ├── /auth/[...nextauth]   # NextAuth authentication
│   │   ├── /stripe/webhook       # Stripe webhook handler
│   │   ├── /scores               # Scores endpoints
│   │   ├── /draws                # Draws endpoints
│   │   └── /charities            # Charities endpoints
│   ├── globals.css               # Global styles with TW CSS variables
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Landing page
│   └── favicon.ico               # App favicon
├── /components                   # Reusable React components
│   ├── /ui                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── toaster.tsx
│   ├── /layout                   # Layout components
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── Sidebar.tsx           # Sidebar navigation
│   │   └── Footer.tsx            # Footer component
│   └── /shared                   # Shared components
│       ├── SubscriptionGate.tsx  # Subscription wall component
│       └── AdminGuard.tsx        # Admin access guard component
├── /lib                          # Utility functions and configurations
│   ├── /supabase
│   │   ├── client.ts             # Browser-side Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   ├── /stripe
│   │   └── client.ts             # Stripe client and server instances
│   ├── /auth
│   │   └── config.ts             # NextAuth configuration
│   ├── utils.ts                  # Utility functions (cn helper)
│   └── types.ts                  # TypeScript type definitions
├── /middleware.ts                # NextAuth middleware for route protection
├── /tsconfig.json                # TypeScript configuration
├── /next.config.ts               # Next.js configuration
├── /tailwind.config.ts           # Tailwind CSS configuration
├── /postcss.config.mjs           # PostCSS configuration
├── /eslint.config.mjs            # ESLint configuration
├── /package.json                 # Project dependencies
├── /.env.local                   # Local environment variables (not versioned)
├── /.env.example                 # Environment variable template
└── /README.md                    # Project documentation
```

## Key Features

- ✅ **Route Groups**: Organized UI structure with auth, public, user, and admin sections
- ✅ **TypeScript**: Strict typing throughout the project
- ✅ **Supabase Integration**: Server and client authentication
- ✅ **Stripe Integration**: Payment processing for subscriptions
- ✅ **NextAuth**: Session management and route protection
- ✅ **shadcn/ui**: Beautiful, accessible component library
- ✅ **Tailwind CSS**: Utility-first styling
- ✅ **Middleware**: Route protection for authenticated users
- ✅ **Email Ready**: Resend integration for transactional emails

## Installation Steps

### 1. Install Dependencies
Run these commands in order:

```bash
# shadcn/ui core
npx shadcn-ui@latest init -d

# shadcn/ui components
npx shadcn-ui@latest add button card input label badge avatar dropdown-menu separator sheet tabs toast dialog form select textarea

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Stripe
npm install stripe @stripe/stripe-js

# NextAuth v5 (beta) with Supabase adapter
npm install next-auth@beta @auth/supabase-adapter

# Email
npm install resend

# Forms & validation
npm install zod react-hook-form @hookform/resolvers

# Environment variables
npm install dotenv
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your actual values:

```bash
cp .env.example .env.local
```

Required variables:
- **Supabase**: Get from https://supabase.com
- **Stripe**: Get from https://stripe.com
- **NEXTAUTH_SECRET**: Generate with: `openssl rand -base64 32`
- **RESEND_API_KEY**: Get from https://resend.com

### 3. Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth authentication endpoint

### Scores
- `GET /api/scores` - Get all scores
- `POST /api/scores` - Submit a new score

### Draws
- `GET /api/draws` - Get all draws
- `POST /api/draws` - Create a new draw

### Charities
- `GET /api/charities` - Get all charities
- `POST /api/charities` - Create a new charity

### Webhooks
- `POST /api/stripe/webhook` - Stripe webhook handler

## Route Protection

Routes are protected using NextAuth middleware (`/src/middleware.ts`):

- **Public routes**: `/`, `/charities` (no auth required)
- **Auth routes**: `/login`, `/signup` (redirects if already authenticated)
- **User routes**: `/dashboard`, `/scores`, `/charity` (redirects to /login if not authenticated)
- **Admin routes**: `/admin/*` (redirects to /login if not authenticated or not admin)

## Development Workflow

1. **Server Components**: Use by default for data fetching
2. **Client Components**: Add `"use client"` directive when needed
3. **Styling**: Use Tailwind CSS classes; shadcn/ui components for UI
4. **Types**: Use TypeScript for all files; avoid `any` types
5. **Imports**: Use `@/` alias for all imports from `/src`

## Next Steps

1. Set up Supabase project and database
2. Configure Stripe keys for payment processing
3. Set up NextAuth with your preferred providers
4. Implement API endpoints with business logic
5. Create forms for user interactions
6. Add email templates via Resend
7. Test payment flow with Stripe test cards
8. Deploy to Vercel or similar platform

## Tools & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
