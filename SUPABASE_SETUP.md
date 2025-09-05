# 🚀 SocialFlow Supabase Setup Guide

This guide will help you set up a Supabase database for your SocialFlow project.

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose your organization (create one if needed)
4. Enter project details:
   - **Name**: `socialflow-mvp`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your location
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Project API Key (anon public)** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Environment Variables

1. In your project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

   # App Configuration  
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content of `database/schema.sql` from this project
3. Paste it in the SQL Editor and click "Run"
4. Wait for all tables and policies to be created

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`

### Optional: Setup OAuth Providers

#### Google OAuth:
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your Google OAuth credentials (from Google Cloud Console)

#### GitHub OAuth:
1. Go to **Authentication** → **Providers** → **GitHub**  
2. Enable GitHub provider
3. Add your GitHub OAuth App credentials

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3003` (or whatever port is shown)

3. Try registering a new account:
   - Go to `/register`
   - Fill in the form with organization details
   - Submit and check if you get redirected to `/dashboard`

4. Check your Supabase dashboard:
   - Go to **Table Editor**
   - You should see new records in `organizations` and `users` tables

## Step 7: Verify Database Structure

In your Supabase **Table Editor**, you should see these tables:

- ✅ `organizations` - Multi-tenant organizations (agencies)
- ✅ `users` - Users belonging to organizations  
- ✅ `projects` - Client projects within organizations
- ✅ `social_accounts` - Connected social media accounts
- ✅ `content` - Content posts with AI generation capability
- ✅ `content_analytics` - Social media performance data
- ✅ `invitations` - Team member invitations

## Production Setup (Later)

For production deployment:

1. Update **Site URL** to your production domain
2. Add production **Redirect URLs**
3. Update `.env` variables on your hosting platform
4. Consider upgrading to Supabase Pro for better performance

## Troubleshooting

### Common Issues:

**"Failed to create organization"**
- Check if the database schema was applied correctly
- Verify your Supabase credentials in `.env.local`
- Check browser console for detailed error messages

**"User not redirected after login"**
- Ensure the `handle_new_user()` function was created in the schema
- Check the `auth.users` trigger is properly set up

**OAuth not working**
- Verify redirect URLs in both Supabase and OAuth provider settings
- Check that the callback route `/auth/callback` is accessible

### Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the logs in **Logs** → **Auth** in your Supabase dashboard
- Open browser developer tools to see detailed error messages

## Security Notes

- Never commit `.env.local` to version control
- Use Row Level Security (RLS) policies for production (already included in schema)
- Regularly rotate your API keys
- Monitor usage in Supabase dashboard to stay within free tier limits

---

Once you complete this setup, your SocialFlow authentication will be fully functional with:
- ✅ User registration with organization setup
- ✅ Email/password login
- ✅ Password reset functionality  
- ✅ OAuth login (if configured)
- ✅ Multi-tenant data isolation
- ✅ Protected dashboard routes