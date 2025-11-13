-- Fix corrupted canvas data by clearing it for affected projects
-- This allows projects to start with a clean canvas

-- Clear canvas data for the two affected projects
UPDATE public.projects
SET
  canvas_data = '{"nodes": [], "edges": [], "toolToPromptIdMapping": {}}'::jsonb,
  last_modified_at = NOW()
WHERE id IN (
  '7f456ad8-d808-4cf7-a694-1faf48a4d1f9',
  '748f6cd6-d9ec-4a27-8ee1-776864c2c634'
);

-- Verify the update
SELECT
  id,
  name,
  jsonb_array_length(canvas_data->'nodes') as node_count,
  jsonb_array_length(canvas_data->'edges') as edge_count,
  last_modified_at
FROM public.projects
WHERE id IN (
  '7f456ad8-d808-4cf7-a694-1faf48a4d1f9',
  '748f6cd6-d9ec-4a27-8ee1-776864c2c634'
)
ORDER BY name;
