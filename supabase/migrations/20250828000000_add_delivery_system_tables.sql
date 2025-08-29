-- Add delivery system tables
-- This migration adds support for the destination delivery system

-- OAuth connections table
CREATE TABLE IF NOT EXISTS oauth_connections (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL CHECK (destination IN ('miro', 'figjam', 'figma')),
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  scopes TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, destination)
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL CHECK (destination IN ('miro', 'figjam', 'figma')),
  target_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'error', 'cancelled')) DEFAULT 'pending',
  delivered_items INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  embed_url TEXT,
  import_url TEXT,
  expires_at TIMESTAMPTZ,
  error TEXT,
  warnings TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ephemeral imports table
CREATE TABLE IF NOT EXISTS ephemeral_imports (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL CHECK (destination IN ('figjam', 'figma')),
  payload JSONB NOT NULL,
  signed_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT 5,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery payloads table (for caching and reference)
CREATE TABLE IF NOT EXISTS delivery_payloads (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL CHECK (destination IN ('miro', 'figjam', 'figma')),
  source_prompt TEXT NOT NULL,
  items JSONB NOT NULL,
  layout_hints JSONB DEFAULT '{}',
  summary TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_destination ON oauth_connections(user_id, destination);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_active ON oauth_connections(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_destination ON deliveries(destination);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ephemeral_imports_expires_at ON ephemeral_imports(expires_at);
CREATE INDEX IF NOT EXISTS idx_ephemeral_imports_user_id ON ephemeral_imports(user_id);

CREATE INDEX IF NOT EXISTS idx_delivery_payloads_user_id ON delivery_payloads(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_payloads_created_at ON delivery_payloads(created_at DESC);

-- Row Level Security (RLS) policies

-- OAuth connections policies
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own OAuth connections" ON oauth_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OAuth connections" ON oauth_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth connections" ON oauth_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth connections" ON oauth_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Deliveries policies
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deliveries" ON deliveries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deliveries" ON deliveries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliveries" ON deliveries
  FOR UPDATE USING (auth.uid() = user_id);

-- Ephemeral imports policies
ALTER TABLE ephemeral_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ephemeral imports" ON ephemeral_imports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ephemeral imports" ON ephemeral_imports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ephemeral imports" ON ephemeral_imports
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can access all ephemeral imports (for the import function)
CREATE POLICY "Service role can access all ephemeral imports" ON ephemeral_imports
  FOR ALL USING (auth.role() = 'service_role');

-- Delivery payloads policies
ALTER TABLE delivery_payloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delivery payloads" ON delivery_payloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery payloads" ON delivery_payloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery payloads" ON delivery_payloads
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_oauth_connections_updated_at 
  BEFORE UPDATE ON oauth_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at 
  BEFORE UPDATE ON deliveries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired ephemeral imports
CREATE OR REPLACE FUNCTION cleanup_expired_imports()
RETURNS void AS $$
BEGIN
  DELETE FROM ephemeral_imports 
  WHERE expires_at < NOW() - INTERVAL '1 hour'; -- Keep for 1 hour after expiry for debugging
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired imports (if pg_cron is available)
-- This would need to be set up separately in production
-- SELECT cron.schedule('cleanup-expired-imports', '0 * * * *', 'SELECT cleanup_expired_imports();');

COMMENT ON TABLE oauth_connections IS 'Stores encrypted OAuth tokens for destination integrations';
COMMENT ON TABLE deliveries IS 'Tracks delivery attempts and results for all destinations';
COMMENT ON TABLE ephemeral_imports IS 'Temporary signed URLs for FigJam/Figma plugin imports';
COMMENT ON TABLE delivery_payloads IS 'Cached normalized payloads for delivery operations';

COMMENT ON COLUMN oauth_connections.access_token_encrypted IS 'AES encrypted OAuth access token';
COMMENT ON COLUMN oauth_connections.refresh_token_encrypted IS 'AES encrypted OAuth refresh token';
COMMENT ON COLUMN deliveries.embed_url IS 'Live embed URL for Miro boards';
COMMENT ON COLUMN deliveries.import_url IS 'Ephemeral import URL for FigJam/Figma plugins';
COMMENT ON COLUMN ephemeral_imports.signed_url IS 'Cryptographically signed URL with expiration';