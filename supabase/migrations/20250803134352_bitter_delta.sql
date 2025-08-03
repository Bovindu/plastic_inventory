/*
  # Fix Triggers and Functions

  This migration safely handles existing triggers and functions by dropping them first
  if they exist, then recreating them properly.

  1. Functions
    - Drop and recreate update_updated_at_column function
  
  2. Triggers  
    - Drop and recreate update_inventory_items_updated_at trigger

  3. Safety
    - Uses IF EXISTS to prevent errors if objects don't exist
    - Ensures clean recreation of database objects
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger for inventory_items
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();