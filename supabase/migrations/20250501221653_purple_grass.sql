/*
  # Create workcell tables and security policies

  1. New Tables
    - `workcells`
      - `id` (uuid, primary key)
      - `name` (text)
      - `instruments` (jsonb) - Stores instrument configurations
      - `status` (text) - Current workcell status (online, offline, error, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid) - Reference to auth.users
    
  2. Security
    - Enable RLS on `workcells` table
    - Add policies for:
      - Admins can perform all operations
      - Editors can view all workcells and manage their own
      - Viewers can only view workcells
*/

-- Create workcells table
CREATE TABLE IF NOT EXISTS workcells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  instruments jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'offline',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE workcells ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins have full access to workcells"
  ON workcells
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Editors can view all workcells"
  ON workcells
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'EDITOR'
  );

CREATE POLICY "Editors can manage their own workcells"
  ON workcells
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'EDITOR'
    AND auth.uid() = user_id
  );

CREATE POLICY "Viewers can view workcells"
  ON workcells
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'VIEWER'
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workcells_updated_at
  BEFORE UPDATE ON workcells
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();