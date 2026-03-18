# Supabase Setup Guide for Chrono

This guide will help you set up Supabase for the Chrono application.

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Enter project details:
   - **Name**: Chrono (or any name you prefer)
   - **Database Password**: Generate a secure password and save it
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait for the project to be created (1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. Find the following values:
   - **Project URL**: Copy this value
   - **anon public**: Copy this value (this is your client-side API key)

4. Create a new file `.env` in the project root with:
```
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace the values with your actual credentials.

## Step 3: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** in the sidebar
2. Click **Settings**
3. Scroll to **Email** section
4. Make sure **Enable Email** is turned ON
5. For development, you can disable **Confirm email** to skip email verification
6. Click **Save**

## Step 4: Create the Schedules Table

1. Go to **SQL Editor** in the Supabase dashboard
2. Run the following SQL to create the schedules table:

```sql
-- Create schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  description TEXT,
  date TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_date ON schedules(date);
```

3. Click **Run** to execute the SQL

## Step 5: Set Up Row Level Security (RLS)

RLS ensures users can only access their own schedules.

1. With the schedules table selected, go to **Authentication** -> **Policies**
2. Or go to **SQL Editor** and run this SQL:

```sql
-- Enable Row Level Security
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own schedules
CREATE POLICY "Users can view their own schedules"
ON schedules
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own schedules
CREATE POLICY "Users can insert their own schedules"
ON schedules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own schedules
CREATE POLICY "Users can update their own schedules"
ON schedules
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own schedules
CREATE POLICY "Users can delete their own schedules"
ON schedules
FOR DELETE
USING (auth.uid() = user_id);
```

3. Click **Run** to apply the policies

## Step 6: Create updated_at Trigger

Add a trigger to automatically update the `updated_at` timestamp:

```sql
-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 7: Test Your Setup

1. Restart your development server:
```bash
npm run dev
```

2. Open the app in your browser
3. You should see the login/register page
4. Try registering a new account
5. Try adding a schedule
6. Verify the schedule appears in the timeline

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file is in the project root
- Restart the dev server after creating/modifying `.env`

### Authentication not working
- Check that Email authentication is enabled in Supabase
- Check that your Supabase URL and anon key are correct

### Cannot see schedules / Permission denied
- Make sure RLS policies are created
- Make sure the user is logged in

### CORS errors
- Supabase allows all origins by default for development
- For production, you can configure allowed origins in Settings -> Authentication

## Environment Variables

Create a `.env` file (do NOT commit this to version control):

```env
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The `.env.example` file shows the required format but doesn't contain real values.

## Database Schema Summary

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | REFERENCES auth.users, NOT NULL |
| title | text | NOT NULL |
| start_time | text | NOT NULL |
| end_time | text | |
| description | text | |
| date | text | NOT NULL |
| completed | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

## Security Notes

- Never expose your `service_role` key (only use anon key in frontend)
- RLS policies ensure data isolation between users
- All database operations go through the Supabase API
