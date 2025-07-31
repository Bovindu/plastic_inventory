-- Setup Inventory Management System Database
-- This migration creates all necessary tables, policies, and demo data

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
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('in stock', 'repurchase needed', 'temporarily unavailable')) DEFAULT 'in stock',
  note text DEFAULT '',
  location text NOT NULL CHECK (location IN ('location-1', 'location-2')) DEFAULT 'location-1',
  category text NOT NULL CHECK (category IN ('material', 'product', 'asset')) DEFAULT 'material',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_inventory_items_updated_at_func()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_items_updated_at_func();

-- Create RLS policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create RLS policies for inventory_items table
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

-- Insert demo users
INSERT INTO users (id, username, role, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'owner', 'owner', 'Factory Owner'),
  ('550e8400-e29b-41d4-a716-446655440002', 'worker', 'worker', 'Factory Worker')
ON CONFLICT (username) DO NOTHING;

-- Insert demo inventory data
INSERT INTO inventory_items (id, item_name, type, price, stock, status, note, location, category) VALUES
  ('MAT001', 'HDPE Pellets', 'virgin', 1.25, 5000, 'in stock', 'High density polyethylene for bottles', 'location-1', 'material'),
  ('MAT002', 'PET Recycled Flakes', 'recycled', 0.85, 25, 'repurchase needed', 'Low stock - reorder soon', 'location-1', 'material'),
  ('MAT003', 'PP Virgin Pellets', 'virgin', 1.15, 3200, 'in stock', 'Polypropylene for caps and containers', 'location-1', 'material'),
  ('MAT004', 'Masterbatch Blue', 'master', 3.50, 150, 'in stock', 'For coloring plastic products', 'location-2', 'material'),
  ('MAT005', 'Masterbatch Red', 'master', 3.50, 75, 'repurchase needed', 'Running low on red colorant', 'location-2', 'material'),
  ('MAT006', 'UV Stabilizer', 'special added', 12.00, 50, 'in stock', 'Prevents UV degradation', 'location-1', 'material'),
  ('PRD001', 'Water Bottles 500ml', null, 0.15, 10000, 'in stock', 'Clear bottles with standard cap', 'location-1', 'product'),
  ('PRD002', 'Juice Bottles 1L', null, 0.25, 5000, 'in stock', 'Wide mouth bottles for juice', 'location-1', 'product'),
  ('PRD003', 'Food Containers 250ml', null, 0.12, 8000, 'in stock', 'Microwave safe containers', 'location-2', 'product'),
  ('PRD004', 'Bottle Caps Standard', null, 0.03, 0, 'repurchase needed', 'Out of stock - urgent reorder', 'location-1', 'product'),
  ('PRD005', 'Bottle Labels', null, 0.02, 15000, 'in stock', 'Waterproof adhesive labels', 'location-2', 'product'),
  ('AST001', 'Injection Molding Machine #1', null, 45000, 1, 'in stock', 'Primary production machine', 'location-1', 'asset'),
  ('AST002', 'Injection Molding Machine #2', null, 45000, 1, 'temporarily unavailable', 'Under maintenance until next week', 'location-2', 'asset'),
  ('AST003', 'Conveyor Belt System', null, 8500, 1, 'in stock', 'Automated product transport', 'location-1', 'asset'),
  ('AST004', 'Quality Control Scanner', null, 15000, 1, 'in stock', 'Automated defect detection', 'location-2', 'asset'),
  ('AST005', 'Packaging Machine', null, 22000, 1, 'repurchase needed', 'Needs replacement parts', 'location-1', 'asset')
ON CONFLICT (id) DO NOTHING;