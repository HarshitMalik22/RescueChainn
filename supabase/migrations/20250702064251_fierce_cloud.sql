/*
  # Create disaster management tables

  1. New Tables
    - `sensors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `location_lat` (numeric)
      - `location_lng` (numeric)
      - `status` (text)
      - `severity` (integer)
      - `last_reading` (numeric)
      - `people_killed` (integer)
      - `last_updated` (timestamp)
      - `created_at` (timestamp)

    - `ngos`
      - `id` (uuid, primary key)
      - `name` (text)
      - `specialization` (text)
      - `wallet_address` (text)
      - `phone` (text)
      - `email` (text)
      - `location_lat` (numeric)
      - `location_lng` (numeric)
      - `created_at` (timestamp)

    - `disaster_events`
      - `id` (uuid, primary key)
      - `sensor_id` (uuid, references sensors)
      - `type` (text)
      - `severity` (integer)
      - `damage_done` (integer)
      - `people_killed` (integer)
      - `location_lat` (numeric)
      - `location_lng` (numeric)
      - `funds_released` (boolean)
      - `transaction_hash` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (for demo purposes)
*/

-- Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('flood', 'earthquake')),
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  status text NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  severity integer NOT NULL DEFAULT 1 CHECK (severity >= 1 AND severity <= 10),
  last_reading numeric NOT NULL DEFAULT 0,
  people_killed integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create NGOs table
CREATE TABLE IF NOT EXISTS ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL CHECK (specialization IN ('flood', 'earthquake', 'both')),
  wallet_address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create disaster events table
CREATE TABLE IF NOT EXISTS disaster_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid REFERENCES sensors(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('flood', 'earthquake')),
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  damage_done integer NOT NULL DEFAULT 0,
  people_killed integer NOT NULL DEFAULT 0,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  funds_released boolean DEFAULT false,
  transaction_hash text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for demo purposes)
CREATE POLICY "Allow public read access to sensors"
  ON sensors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to ngos"
  ON ngos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to disaster_events"
  ON disaster_events FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert disaster events
CREATE POLICY "Allow authenticated users to insert disaster events"
  ON disaster_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert sample data
INSERT INTO sensors (name, type, location_lat, location_lng, status, severity, last_reading, people_killed) VALUES
  ('Flood Sensor - Bangkok', 'flood', 13.7563, 100.5018, 'normal', 8, 2, 100000),
  ('Earthquake Sensor - Tokyo', 'earthquake', 35.6762, 139.6503, 'normal', 5, 1, 1000),
  ('Flood Sensor - Mumbai', 'flood', 19.0760, 72.8777, 'normal', 4, 3, 1000),
  ('Earthquake Sensor - San Francisco', 'earthquake', 37.7749, -122.4194, 'normal', 3, 2, 1000),
  ('Flood Sensor - Jakarta', 'flood', -6.2088, 106.8456, 'critical', 7, 6, 500000);

INSERT INTO ngos (name, specialization, wallet_address, phone, email, location_lat, location_lng) VALUES
  ('Flood Relief International', 'flood', '0x1234567890123456789012345678901234567890', '+1234567890', 'info@floodrelief.org', 13.8, 100.6),
  ('Earthquake Response Team', 'earthquake', '0x0987654321098765432109876543210987654321', '+0987654321', 'help@earthquakeresponse.org', 35.7, 139.7),
  ('Global Disaster Aid', 'both', '0xabcdef1234567890abcdef1234567890abcdef12', '+1122334455', 'contact@globaldisasteraid.org', 19.1, 72.9);