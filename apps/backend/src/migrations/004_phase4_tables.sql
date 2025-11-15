-- Phase 4: Template, Collaboration, and Export Tables
-- Migration 004 - Created: October 8, 2025

-- Template System Tables

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  industry VARCHAR(100),
  tags TEXT[],
  thumbnail_url TEXT,
  preview_url TEXT,
  design_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_industry ON templates(industry);
CREATE INDEX idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX idx_templates_popularity ON templates(downloads DESC, rating DESC);
CREATE INDEX idx_templates_search ON templates USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  description TEXT,
  design_data JSONB NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, version_number)
);

CREATE INDEX idx_template_versions_template_id ON template_versions(template_id, version_number DESC);

CREATE TABLE IF NOT EXISTS template_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  share_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  password_hash VARCHAR(255),
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_template_shares_token ON template_shares(share_token);
CREATE INDEX idx_template_shares_template_id ON template_shares(template_id);

CREATE TABLE IF NOT EXISTS template_analytics (
  id BIGSERIAL PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'use', 'download'
  user_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_template_analytics_template_id ON template_analytics(template_id, created_at DESC);
CREATE INDEX idx_template_analytics_event ON template_analytics(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS template_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

CREATE INDEX idx_template_favorites_user ON template_favorites(user_id);

-- Collaboration Tables

CREATE TABLE IF NOT EXISTS design_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by VARCHAR(255),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(design_id, user_id)
);

CREATE INDEX idx_design_collaborators_design_id ON design_collaborators(design_id);
CREATE INDEX idx_design_collaborators_user_id ON design_collaborators(user_id);

CREATE TABLE IF NOT EXISTS design_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  object_id UUID,
  content TEXT NOT NULL,
  x DECIMAL(10,4),
  y DECIMAL(10,4),
  parent_id UUID REFERENCES design_comments(id) ON DELETE CASCADE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_comments_design_id ON design_comments(design_id, created_at DESC);
CREATE INDEX idx_design_comments_object_id ON design_comments(object_id);
CREATE INDEX idx_design_comments_parent_id ON design_comments(parent_id);

CREATE TABLE IF NOT EXISTS design_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  snapshot JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(design_id, version_number)
);

CREATE INDEX idx_design_versions_design_id ON design_versions(design_id, version_number DESC);

CREATE TABLE IF NOT EXISTS design_change_log (
  id BIGSERIAL PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  change_type VARCHAR(50) NOT NULL,
  object_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_change_log_design_id ON design_change_log(design_id, created_at DESC);
CREATE INDEX idx_design_change_log_user_id ON design_change_log(user_id);

-- Export Tables

CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'png', 'jpg', 'svg')),
  quality VARCHAR(10) NOT NULL CHECK (quality IN ('low', 'medium', 'high', 'ultra')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  options JSONB,
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_export_jobs_design_id ON export_jobs(design_id);
CREATE INDEX idx_export_jobs_user_id ON export_jobs(user_id, created_at DESC);
CREATE INDEX idx_export_jobs_status ON export_jobs(status, created_at DESC);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_comments_updated_at BEFORE UPDATE ON design_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_design_comments_resolved ON design_comments(design_id) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_export_jobs_pending ON export_jobs(created_at ASC) WHERE status = 'pending';

