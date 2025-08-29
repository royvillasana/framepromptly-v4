-- Create delivery system tables for FramePromptly
-- Migration for delivery tracking, OAuth connections, and ephemeral imports

-- Table for tracking deliveries to destinations
CREATE TABLE IF NOT EXISTS public.deliveries (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination TEXT NOT NULL CHECK (destination IN ('miro', 'figjam', 'figma')),
    target_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'success', 'failed')),
    delivered_items INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    embed_url TEXT,
    import_url TEXT,
    expires_at TIMESTAMPTZ,
    error TEXT,
    warnings TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for OAuth connections to third-party services
CREATE TABLE IF NOT EXISTS public.oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL CHECK (service IN ('miro', 'figjam', 'figma')),
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    expires_at TIMESTAMPTZ,
    scope TEXT[],
    connection_metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, service)
);

-- Table for ephemeral imports (temporary signed URLs)
CREATE TABLE IF NOT EXISTS public.ephemeral_imports (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination TEXT NOT NULL CHECK (destination IN ('figjam', 'figma')),
    payload JSONB NOT NULL,
    signed_url TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON public.deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_destination ON public.deliveries(destination);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON public.deliveries(created_at);

CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON public.oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_service ON public.oauth_connections(service);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_active ON public.oauth_connections(is_active);

CREATE INDEX IF NOT EXISTS idx_ephemeral_imports_user_id ON public.ephemeral_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_ephemeral_imports_expires_at ON public.ephemeral_imports(expires_at);
CREATE INDEX IF NOT EXISTS idx_ephemeral_imports_destination ON public.ephemeral_imports(destination);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ephemeral_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliveries
CREATE POLICY "Users can view their own deliveries" ON public.deliveries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deliveries" ON public.deliveries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliveries" ON public.deliveries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deliveries" ON public.deliveries
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for oauth_connections
CREATE POLICY "Users can view their own oauth connections" ON public.oauth_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own oauth connections" ON public.oauth_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oauth connections" ON public.oauth_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth connections" ON public.oauth_connections
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ephemeral_imports
CREATE POLICY "Users can view their own ephemeral imports" ON public.ephemeral_imports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ephemeral imports" ON public.ephemeral_imports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ephemeral imports" ON public.ephemeral_imports
    FOR UPDATE USING (auth.uid() = user_id);

-- Public access for ephemeral imports via signed URL (no RLS for reads)
CREATE POLICY "Public can read ephemeral imports by ID" ON public.ephemeral_imports
    FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_deliveries_updated_at 
    BEFORE UPDATE ON public.deliveries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_connections_updated_at 
    BEFORE UPDATE ON public.oauth_connections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup expired ephemeral imports
CREATE OR REPLACE FUNCTION cleanup_expired_ephemeral_imports()
RETURNS void AS $$
BEGIN
    DELETE FROM public.ephemeral_imports 
    WHERE expires_at < NOW();
END;
$$ language plpgsql;