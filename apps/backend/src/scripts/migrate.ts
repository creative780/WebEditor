import pool from '../config/database';

const migrations = `
-- Users table (basic for now)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designs table
CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  unit VARCHAR(10) NOT NULL DEFAULT 'in',
  dpi INTEGER NOT NULL DEFAULT 300,
  bleed DECIMAL(10,2) DEFAULT 0.125,
  color_mode VARCHAR(10) DEFAULT 'rgb',
  version INTEGER NOT NULL DEFAULT 1,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_by UUID REFERENCES users(id)
);

-- Design objects table
CREATE TABLE IF NOT EXISTS design_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  x DECIMAL(10,4) NOT NULL,
  y DECIMAL(10,4) NOT NULL,
  width DECIMAL(10,4) NOT NULL,
  height DECIMAL(10,4) NOT NULL,
  rotation DECIMAL(10,4) DEFAULT 0,
  opacity DECIMAL(3,2) DEFAULT 1,
  z_index INTEGER NOT NULL,
  locked BOOLEAN DEFAULT FALSE,
  visible BOOLEAN DEFAULT TRUE,
  name VARCHAR(255),
  properties JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change history for undo/redo
CREATE TABLE IF NOT EXISTS design_changes (
  id BIGSERIAL PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  operation VARCHAR(50) NOT NULL,
  object_id UUID,
  before_state JSONB,
  after_state JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_design_objects_design_id ON design_objects(design_id);
CREATE INDEX IF NOT EXISTS idx_design_objects_z_index ON design_objects(design_id, z_index);
CREATE INDEX IF NOT EXISTS idx_design_changes_design_id ON design_changes(design_id, timestamp DESC);
`;

async function migrate() {
  try {
    console.log('Running migrations...');
    await pool.query(migrations);
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

