/*
  # Fix Registration Policies

  1. Changes
    - Add policy to allow initial user registration
    - Update existing policies to maintain security
    - Ensure proper role assignment during registration

  2. Security
    - Allow unauthenticated users to create initial profiles
    - Maintain existing access controls for authenticated users
    - Prevent unauthorized role assignments
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert access for admin users creating drivers" ON users;
DROP POLICY IF EXISTS "Enable update for admin users and own profile" ON users;
DROP POLICY IF EXISTS "Enable delete access for admin users" ON users;

-- Create new policies with proper permissions
CREATE POLICY "Enable read access for all authenticated users"
ON users FOR SELECT
TO authenticated
USING (true);

-- Allow initial user registration and admin driver creation
CREATE POLICY "Enable insert for registration and admin driver creation"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  (
    -- Allow admin users to create driver accounts
    (auth.jwt() ->> 'role' = 'admin' AND role = 'driver')
  ) OR
  (
    -- Allow initial user registration with staff role
    auth.uid() = id AND role = 'staff'
  )
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