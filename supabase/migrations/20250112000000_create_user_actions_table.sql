-- Create user_actions table for real-time analytics
CREATE TABLE IF NOT EXISTS user_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  page TEXT,
  user_agent TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_session_id ON user_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action ON user_actions(action);
CREATE INDEX IF NOT EXISTS idx_user_actions_category ON user_actions(category);
CREATE INDEX IF NOT EXISTS idx_user_actions_page ON user_actions(page);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_actions_user_timestamp ON user_actions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_timestamp ON user_actions(action, timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own actions" ON user_actions
  FOR SELECT USING (
    auth.uid()::TEXT = user_id OR 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can insert their own actions" ON user_actions
  FOR INSERT WITH CHECK (
    auth.uid()::TEXT = user_id OR 
    user_id IS NULL -- Allow anonymous tracking
  );

-- Create function to clean up old user actions (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_user_actions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM user_actions 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$;

-- Create a trigger to automatically clean up old data weekly
-- This would be set up as a cron job in production