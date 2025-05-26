/*
  # Fix RLS policies for user creation

  1. Changes
    - Add new RLS policy to allow admin users to insert new users
    - Update existing admin policy to use service role for full access
    - Remove redundant policies

  2. Security
    - Ensure admin users can create new users
    - Maintain existing read access for authenticated users
    - Ensure proper role-based access control
*/

-- Drop existing policies to clean up
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create new policies with proper permissions
CREATE POLICY "Enable read access for all authenticated users"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for admin users"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

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