/*
  # Create Inventory Management Schema

  1. New Tables
     - users: id, username, role, name, created_at
     - inventory_items: id, item_name, type, price, stock, status, note, location, category, timestamps

  2. Security
     - Enable RLS on both tables
     - Add policies for authenticated users
     - Role-based access control

  3. Demo Data
     - Sample users (owner and worker)
     - Sample inventory items across all categories
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can read inventory" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON inventory_items;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;

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
  -- Materials for Location 1
  ('MAT001', 'HDPE Pellets', 'virgin', 1.25, 5000, 'in stock', 'High density polyethylene for bottles', 'location-1', 'material'),
  ('MAT002', 'PET Recycled Flakes', 'recycled', 0.85, 25, 'repurchase needed', 'Low stock - reorder soon', 'location-1', 'material'),
  ('MAT003', 'PP Virgin Granules', 'virgin', 1.15, 3200, 'in stock', 'Polypropylene for caps and containers', 'location-1', 'material'),
  ('MAT004', 'Masterbatch Red', 'master', 3.50, 80, 'in stock', 'Red colorant for plastic products', 'location-1', 'material'),
  ('MAT005', 'UV Stabilizer', 'special added', 12.50, 45, 'repurchase needed', 'UV protection additive', 'location-1', 'material'),
  
  -- Materials for Location 2
  ('MAT006', 'LDPE Film Grade', 'virgin', 1.10, 2800, 'in stock', 'Low density polyethylene for films', 'location-2', 'material'),
  ('MAT007', 'Masterbatch Blue', 'master', 3.50, 150, 'in stock', 'Blue colorant for plastic products', 'location-2', 'material'),
  ('MAT008', 'Recycled HDPE', 'recycled', 0.95, 1500, 'in stock', 'Recycled high density polyethylene', 'location-2', 'material'),
  ('MAT009', 'Antioxidant Additive', 'special added', 8.75, 60, 'in stock', 'Prevents plastic degradation', 'location-2', 'material'),
  
  -- Products for Location 1
  ('PRD001', 'Water Bottles 500ml', null, 0.15, 10000, 'in stock', 'Clear bottles with standard cap', 'location-1', 'product'),
  ('PRD002', 'Juice Bottles 1L', null, 0.25, 5000, 'in stock', 'Large bottles for juice packaging', 'location-1', 'product'),
  ('PRD003', 'Bottle Caps Standard', null, 0.02, 50000, 'in stock', 'Standard screw caps for bottles', 'location-1', 'product'),
  ('PRD004', 'Food Containers 250ml', null, 0.12, 8000, 'repurchase needed', 'Small containers for food storage', 'location-1', 'product'),
  
  -- Products for Location 2
  ('PRD005', 'Plastic Bags Small', null, 0.05, 25000, 'in stock', 'Small shopping bags', 'location-2', 'product'),
  ('PRD006', 'Plastic Bags Large', null, 0.08, 15000, 'in stock', 'Large shopping bags', 'location-2', 'product'),
  ('PRD007', 'Storage Boxes 5L', null, 1.50, 2000, 'temporarily unavailable', 'Currently out of production', 'location-2', 'product'),
  ('PRD008', 'Disposable Cups', null, 0.03, 30000, 'in stock', 'Single-use plastic cups', 'location-2', 'product'),
  
  -- Assets for Location 1
  ('AST001', 'Injection Molding Machine #1', null, 45000, 1, 'in stock', 'Primary bottle production machine', 'location-1', 'asset'),
  ('AST002', 'Conveyor Belt System A', null, 8500, 1, 'in stock', 'Automated product transport', 'location-1', 'asset'),
  ('AST003', 'Quality Control Scanner', null, 12000, 1, 'temporarily unavailable', 'Under calibration', 'location-1', 'asset'),
  ('AST004', 'Packaging Machine #1', null, 25000, 1, 'in stock', 'Automated packaging system', 'location-1', 'asset'),
  
  -- Assets for Location 2
  ('AST005', 'Injection Molding Machine #2', null, 45000, 1, 'temporarily unavailable', 'Under maintenance', 'location-2', 'asset'),
  ('AST006', 'Extruder Machine', null, 35000, 1, 'in stock', 'Film and bag production', 'location-2', 'asset'),
  ('AST007', 'Conveyor Belt System B', null, 8500, 1, 'in stock', 'Secondary transport system', 'location-2', 'asset'),
  ('AST008', 'Heat Sealing Machine', null, 15000, 1, 'repurchase needed', 'Needs replacement soon', 'location-2', 'asset')
ON CONFLICT (id) DO NOTHING;