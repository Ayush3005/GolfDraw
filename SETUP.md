# GolfDraw - Setup Instructions

## Step 1: Install All Dependencies

Run these commands in your terminal (one after another):

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init -d

# Add all required shadcn/ui components
npx shadcn-ui@latest add button card input label badge avatar dropdown-menu separator sheet tabs toast dialog form select textarea

# Install Supabase
npm install @supabase/supabase-js @supabase/ssr

# Install Stripe
npm install stripe @stripe/stripe-js

# Install NextAuth (beta) with Supabase adapter
npm install next-auth@beta @auth/supabase-adapter

# Install Resend for emails
npm install resend

# Install form handling
npm install zod react-hook-form @hookform/resolvers

# Install environment variable support
npm install dotenv
```

## Step 2: Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in your actual values:

```env
# Get from: https://supabase.com (create a new project)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_generated_secret_here

# Base URL for NextAuth
NEXTAUTH_URL=http://localhost:3000

# Get from: https://stripe.com (test keys)
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_key_here

# Get from: https://resend.com
RESEND_API_KEY=re_your_key_here
```

## Step 3: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 4: Verify Routes

Test these routes to confirm everything works:

- **Public**: 
  - http://localhost:3000 (Landing page)
  - http://localhost:3000/charities (Charities listing)
  - http://localhost:3000/login (Login page)
  - http://localhost:3000/signup (Signup page)

- **Protected** (will redirect to /login without session):
  - http://localhost:3000/dashboard (User dashboard)
  - http://localhost:3000/scores (Score tracking)
  - http://localhost:3000/charity (Charity selection)
  - http://localhost:3000/admin (Admin dashboard)

## Project Structure at a Glance

```
/src
  /app                    → Pages organized by route group
  /components
    /ui                   → shadcn/ui components (auto-added)
    /layout               → Navbar, Sidebar, Footer
    /shared               → SubscriptionGate, AdminGuard
  /lib
    /supabase             → Supabase client & server
    /stripe               → Stripe client & server
    /auth                 → NextAuth configuration
    utils.ts              → Utility functions
    types.ts              → TypeScript definitions
  /middleware.ts          → Route protection
```

## File Organization

- **Route Groups** (parentheses don't affect URL):
  - (auth) → /login, /signup
  - (public) → /, /charities
  - (user) → /dashboard, /scores, /charity
  - (admin) → /admin, /admin/users, /admin/draws, etc.

- **API Routes**:
  - /api/auth/[...nextauth]
  - /api/stripe/webhook
  - /api/scores
  - /api/draws
  - /api/charities

## Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | cn() helper for Tailwind class merging |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/lib/stripe/client.ts` | Stripe instances for client & server |
| `src/lib/auth/config.ts` | NextAuth configuration |
| `src/lib/types.ts` | TypeScript interfaces for domain models |
| `src/middleware.ts` | Route protection logic |
| `tailwind.config.ts` | Tailwind + shadcn theme |
| `src/app/globals.css` | CSS variables for shadcn theme |
| `src/app/layout.tsx` | Root layout with Inter font & metadata |

## Common Tasks

### Adding a New Page
1. Create folder in `/src/app/{route-group}/your-page/`
2. Create `page.tsx` with default export function
3. Add "use client" if it needs interactions

### Adding a New Component
1. Create file in `/src/components/{category}/YourComponent.tsx`
2. Add "use client" if interactive
3. Use Tailwind for styling, shadcn/ui for UI elements

### Adding a New API Endpoint
1. Create file in `/src/app/api/your-endpoint/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` functions as needed
3. Return `NextResponse` with status and data

### Using Supabase
```typescript
// Client side (use client)
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Server side (async functions)
import { getSupabaseServer } from "@/lib/supabase/server";
const supabase = await getSupabaseServer();
```

### Using Stripe
```typescript
import { getStripeClient, getStripeServer } from "@/lib/stripe/client";

// Client side
const stripe = await getStripeClient();

// Server side
const stripe = getStripeServer();
```

## Troubleshooting

**Issue**: Port 3000 already in use
```bash
npm run dev -- -p 3001
```

**Issue**: TypeScript errors not clearing
```bash
rm -rf .next && npm run dev
```

**Issue**: Imports not resolving
- Check `tsconfig.json` has `"@/*": "./src/*"` in paths
- Restart VS Code

**Issue**: Components not rendering
- Check "use client" directive for interactive components
- Verify file extensions are .tsx
- Check syntax matches examples

## Next: Creating Database Schema & Models

See `PROJECT_STRUCTURE.md` for detailed project overview and resources.

## Support Resources

- Next.js 15 Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- NextAuth Docs: https://next-auth.js.org
- shadcn/ui: https://ui.shadcn.com
