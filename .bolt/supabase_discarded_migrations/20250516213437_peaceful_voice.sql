/*
  # Clear Users Data

  1. Changes
    - Remove all existing users from the users table
    - Reset related foreign key references in other tables
  
  2. Safety Measures
    - Maintain table structure and constraints
    - Handle foreign key dependencies properly
*/

-- First, update any tables that reference users to avoid foreign key violations
UPDATE vehicles 
SET assigned_driver_id = NULL 
WHERE assigned_driver_id IS NOT NULL;

UPDATE maintenance_events 
SET created_by = NULL 
WHERE created_by IS NOT NULL;

-- Now safely delete all users
DELETE FROM users;