-- Add conversation_history field to prompts table to store full conversation data
ALTER TABLE prompts ADD COLUMN conversation_history JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe the field structure
COMMENT ON COLUMN prompts.conversation_history IS 'Stores conversation messages as JSON array with structure: [{"id": string, "type": "user"|"ai", "content": string, "timestamp": ISO string}]';