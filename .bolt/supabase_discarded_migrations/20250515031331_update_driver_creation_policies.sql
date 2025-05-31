/*
  # Update users table RLS policies

  1. Changes
    - Update RLS policies to allow admin users to create driver accounts
    - Remove auth user creation requirement
    - Simplify user creation process

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Read access for authenticated users
      - Insert access for admin users (drivers only)
      - Update access for admin users and own profile
      - Delete access for admin users
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

CREATE POLICY "Enable insert access for admin users creating drivers"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role' = 'admin') AND
  (role = 'driver')
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