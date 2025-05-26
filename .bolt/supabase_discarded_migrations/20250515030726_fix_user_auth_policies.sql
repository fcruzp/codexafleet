/*
  # Fix user creation policies

  1. Changes
    - Update RLS policies for users table to allow admin users to create new users
    - Add policy for admin users to manage auth.users
    - Ensure proper role-based access control

  2. Security
    - Enable RLS on users table
    - Add policies for admin users to manage users
    - Add policies for users to read all users
    - Add policies for users to update their own profile
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert access for admin users" ON users;
DROP POLICY IF EXISTS "Enable update for admin users and own profile" ON users;
DROP POLICY IF EXISTS "Enable delete access for admin users" ON users;

-- Create new policies with proper permissions
CREATE POLICY "Enable read access for all authenticated users"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for admin users"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Enable update for admin users and own profile"
ON users FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'role' = 'admin') OR 
  (auth.uid() = id)
)
WITH CHECK (
  (auth.jwt() ->> 'role' = 'admin') OR 
  (auth.uid() = id)
);

CREATE POLICY "Enable delete access for admin users"
ON users FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');