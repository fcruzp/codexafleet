/*
  # Update user management policies

  1. Changes
    - Add policy for admin users to manage other users
    - Add policy for users to update their own profile
    - Add policy for all authenticated users to read user data

  2. Security
    - Only admin users can create/delete users
    - Users can only update their own profile
    - All authenticated users can read user data
*/

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Enable insert for registration" ON users;
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create new policies
CREATE POLICY "Admin can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Users can read all users"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);