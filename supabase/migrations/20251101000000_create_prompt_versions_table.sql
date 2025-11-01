-- Migration: Create prompt_versions table for version control
-- Description: Track all versions of generated prompts with full history and rollback capability

-- Create prompt_versions table
CREATE TABLE public.prompt_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Version metadata
  version_number INTEGER NOT NULL,
  version_title TEXT NOT NULL DEFAULT 'Version',
  is_active BOOLEAN DEFAULT false,

  -- Version content snapshot
  prompt_content TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,

  -- Conversation history at this version
  conversation JSONB DEFAULT '[]'::jsonb,

  -- Change tracking
  change_summary TEXT,
  parent_version_id UUID REFERENCES public.prompt_versions(id) ON DELETE SET NULL,

  -- Additional metadata
  ai_response TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Ensure unique version numbers per prompt
  UNIQUE(prompt_id, version_number)
);

-- Create indexes for better query performance
CREATE INDEX idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_user_id ON public.prompt_versions(user_id);
CREATE INDEX idx_prompt_versions_created_at ON public.prompt_versions(created_at DESC);
CREATE INDEX idx_prompt_versions_active ON public.prompt_versions(is_active) WHERE is_active = true;
CREATE INDEX idx_prompt_versions_version_number ON public.prompt_versions(prompt_id, version_number);

-- Enable Row Level Security
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own prompt versions
CREATE POLICY "Users can view their own prompt versions"
ON public.prompt_versions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompt versions"
ON public.prompt_versions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt versions"
ON public.prompt_versions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompt versions"
ON public.prompt_versions
FOR DELETE
USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.prompt_versions IS 'Version control for generated prompts - tracks full history of changes';
COMMENT ON COLUMN public.prompt_versions.version_number IS 'Sequential version number for this prompt (1, 2, 3, ...)';
COMMENT ON COLUMN public.prompt_versions.version_title IS 'User-defined title for this version (e.g., "Original", "After client feedback")';
COMMENT ON COLUMN public.prompt_versions.is_active IS 'True if this is the currently active version';
COMMENT ON COLUMN public.prompt_versions.prompt_content IS 'Snapshot of the prompt content at this version';
COMMENT ON COLUMN public.prompt_versions.conversation IS 'Snapshot of conversation messages at this version';
COMMENT ON COLUMN public.prompt_versions.change_summary IS 'Optional description of what changed in this version';
COMMENT ON COLUMN public.prompt_versions.parent_version_id IS 'The version this was created from (for branching)';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_versions TO authenticated;
