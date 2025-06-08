# Next.js + Supabase Authentication Starter

A complete starter template for Next.js with Supabase authentication pre-configured and ready to use.

## Features

- ✓ Email/Password Authentication
- ✓ Protected Routes with Middleware
- ✓ Session Management
- ✓ Server-Side Rendering Support
- ✓ TypeScript Support
- ✓ Tailwind CSS for Styling
- ✓ Server Actions for Auth
- ✓ Automatic Route Protection

## Complete Setup Guide

### Prerequisites

- Node.js 18+ or Bun installed
- A GitHub account (for Supabase signup)
- A code editor (VS Code recommended)

### Step 1: Clone and Install

1. **Clone this repository**
   ```bash
   git clone <repository-url>
   cd supabase_nextjs_starter
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Step 2: Create a Supabase Account & Project

1. **Sign up for Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub (recommended) or email

2. **Create a new project**
   - Click "New project"
   - Choose your organization (or create one)
   - Enter project details:
     - **Name**: Choose any name (e.g., "my-auth-app")
     - **Database Password**: Generate a strong password (save this!)
     - **Region**: Choose the closest to your users
     - **Pricing Plan**: Free tier is perfect for getting started
   - Click "Create new project"
   - Wait ~2 minutes for your project to be ready

3. **Get your project credentials**
   - Once your project is ready, you'll be in the Dashboard
   - Click the "Settings" icon (gear) in the sidebar
   - Click "API" in the settings menu
   - You'll see your credentials:
     - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
     - **Anon/Public Key**: A long string starting with `eyJ...`
   - Keep this page open, you'll need these values

### Step 3: Configure the Application

1. **Set up environment variables**
   - In your project directory, you'll find `.env.local`
   - Open it and replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
   ```
   - Save the file

### Step 4: Configure Supabase Authentication

1. **Set up Email Authentication**
   - In your Supabase Dashboard, click "Authentication" in the sidebar
   - Click "Providers" under Configuration
   - Ensure "Email" is enabled (it should be by default)

2. **Configure redirect URLs**
   - Still in Authentication, click "URL Configuration"
   - Add these URLs to "Redirect URLs":
     - `http://localhost:3000/auth/confirm` (for local development)
     - `http://localhost:3000/auth/callback` (alternative callback)
   - If you have a production domain, also add:
     - `https://yourdomain.com/auth/confirm`
     - `https://yourdomain.com/auth/callback`
   - Click "Save"

3. **Configure Email Templates (Optional but Recommended)**
   - Click "Email Templates" in the Authentication section
   - Click on "Confirm signup" template
   - You can customize the email users receive
   - Make sure the "Confirm your email" link points to: `{{ .ConfirmationURL }}`

### Step 5: Run the Application

1. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the welcome page

3. **Test the authentication**
   - Click "Create an account"
   - Enter an email and password
   - Click "Sign up"
   - Check your email for the confirmation link
   - Click the link to confirm your account
   - You'll be redirected to the dashboard

### Step 6: Understanding the Email Flow

**Important**: By default, Supabase sends a confirmation email for new signups.

- **Development**: Emails might go to spam, check there first
- **For testing**: You can disable email confirmation:
  1. Go to Authentication → Providers
  2. Click "Email" 
  3. Toggle off "Confirm email"
  4. Save changes
  
**Note**: Always use email confirmation in production for security!

## Environment Variables

Ensure you have a `.env.local` file by copying `.env.example`. This file should contain your Supabase and Stripe API keys.
Specifically, for Stripe integration, you will need:
- `STRIPE_SECRET_KEY`: Your Stripe secret key.
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret for the `stripe-webhooks` Edge Function.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key for client-side operations.

These variables are used by Next.js API routes and Supabase Edge Functions. Remember to also set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in your Supabase project's Edge Function settings.

## Project Structure

```
supabase_nextjs_starter/
├── app/
│   ├── auth/
│   │   ├── confirm/
│   │   │   └── route.ts      # Handles email confirmation callbacks
│   │   └── signout/
│   │       └── route.ts      # Handles user sign out
│   ├── dashboard/
│   │   └── page.tsx          # Protected dashboard (requires auth)
│   ├── error/
│   │   └── page.tsx          # Error page for auth failures
│   ├── login/
│   │   ├── actions.ts        # Server actions for login/signup
│   │   └── page.tsx          # Login/Signup form page
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (redirects if authenticated)
├── utils/
│   └── supabase/
│       ├── client.ts         # Browser-side Supabase client
│       ├── server.ts         # Server-side Supabase client
│       └── middleware.ts     # Session refresh logic
├── middleware.ts             # Next.js middleware for route protection
├── .env.local               # Environment variables (git ignored)
└── package.json             # Dependencies and scripts
```

## How It Works

### Authentication Flow

1. **Sign Up Process**
   - User fills out email/password on `/login`
   - Server action creates account via Supabase
   - Supabase sends confirmation email
   - User clicks link → redirected to `/auth/confirm`
   - Route handler verifies token and redirects to `/dashboard`

2. **Sign In Process**
   - User enters credentials on `/login`
   - Server action authenticates via Supabase
   - Session cookie is set automatically
   - User is redirected to `/dashboard`

3. **Protected Routes**
   - Middleware intercepts all requests
   - Checks for valid Supabase session
   - Redirects to `/login` if not authenticated
   - Refreshes session tokens automatically

4. **Sign Out**
   - User clicks sign out on `/dashboard`
   - POST request to `/auth/signout`
   - Session is cleared
   - User redirected to `/login`

## Common Issues & Solutions

### Issue: "Invalid API key"
**Solution**: Double-check your `.env.local` file. Make sure you copied the correct values from Supabase.

### Issue: Email not received
**Solutions**:
1. Check spam/junk folder
2. Verify email provider isn't blocking
3. For testing, disable email confirmation in Supabase Dashboard

### Issue: "Failed to fetch" errors
**Solution**: Ensure your Supabase project is active (not paused) and the URL is correct.

### Issue: Redirect after confirmation fails
**Solution**: Add redirect URLs in Supabase Dashboard → Authentication → URL Configuration

## Customization Guide

### Styling
- All components use Tailwind CSS classes
- Modify colors, spacing, etc. directly in the component files
- Global styles are in `app/globals.css`

### Adding New Protected Pages
1. Create new page in `app/` directory
2. Add authentication check:
```typescript
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Your page content
}
```

### Adding Social Authentication
1. Enable provider in Supabase Dashboard → Authentication → Providers
2. Add provider button to login page
3. Use `supabase.auth.signInWithOAuth()` method

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Update Supabase**
   - Add your production URL to redirect URLs in Supabase
   - Update any CORS settings if needed

### Deploy to Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

Just ensure you set the environment variables on your chosen platform.

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use Row Level Security (RLS)** in Supabase for data access
3. **Enable email confirmation** in production
4. **Set up proper CORS** in Supabase Dashboard
5. **Use strong passwords** for your database
6. **Regularly rotate** your API keys
7. **Monitor authentication logs** in Supabase Dashboard

## Next Steps

- **Add user profiles**: Create a `profiles` table in Supabase
- **Implement password reset**: Add forgot password functionality
- **Add social logins**: Google, GitHub, etc.
- **Set up RLS policies**: Secure your database
- **Add role-based access**: Admin vs regular users
- **Implement MFA**: Two-factor authentication
- **Add user avatars**: Profile picture uploads
- **Create API routes**: For additional functionality

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## Support

- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Next.js Discord**: [nextjs.org/discord](https://nextjs.org/discord)
- **GitHub Issues**: For bug reports and feature requests

## License

MIT License - feel free to use this starter for any project!

---

Built with ❤️ using Next.js and Supabase
