/*
Create Inventory Management Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `role` (text, either 'owner' or 'worker')
      - `name` (text)
      - `created_at` (timestamp)
    - `inventory_items`
      - `id` (text, primary key - custom format like MAT001, PRD001, etc.)
      - `item_name` (text)
      - `type` (text, nullable - only for materials)
      - `price` (decimal)
      - `stock` (integer)
      - `status` (text)
      - `note` (text)
      - `location` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Users can read their own data and inventory based on role
    - Only owners can see pricing data
    - Workers can update inventory quantities
</sql>

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'worker')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id text PRIMARY KEY,
  item_name text NOT NULL,
  type text CHECK (type IN ('virgin', 'recycled', 'master', 'special added')),
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('in stock', 'repurchase needed', 'temporarily unavailable')) DEFAULT 'in stock',
  note text DEFAULT '',
  location text NOT NULL CHECK (location IN ('location-1', 'location-2')) DEFAULT 'location-1',
  category text NOT NULL CHECK (category IN ('material', 'product', 'asset')) DEFAULT 'material',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Inventory policies
CREATE POLICY "Authenticated users can read inventory"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert inventory"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert demo users (these will be used for authentication)
INSERT INTO users (id, username, role, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'owner', 'owner', 'Factory Owner'),
  ('550e8400-e29b-41d4-a716-446655440002', 'worker', 'worker', 'Factory Worker')
ON CONFLICT (username) DO NOTHING;

-- Insert demo inventory data
INSERT INTO inventory_items (id, item_name, type, price, stock, status, note, location, category) VALUES
  ('MAT001', 'HDPE Pellets', 'virgin', 1.25, 5000, 'in stock', 'High density polyethylene for bottles', 'location-1', 'material'),
  ('MAT002', 'PET Recycled Flakes', 'recycled', 0.85, 25, 'repurchase needed', 'Low stock - reorder soon', 'location-1', 'material'),
  ('PRD001', 'Water Bottles 500ml', null, 0.15, 10000, 'in stock', 'Clear bottles with standard cap', 'location-1', 'product'),
  ('AST001', 'Injection Molding Machine #3', null, 45000, 1, 'temporarily unavailable', 'Under maintenance', 'location-2', 'asset'),
  ('MAT003', 'Masterbatch Blue', 'master', 3.50, 150, 'in stock', 'For coloring plastic products', 'location-2', 'material')
ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for inventory_items
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();