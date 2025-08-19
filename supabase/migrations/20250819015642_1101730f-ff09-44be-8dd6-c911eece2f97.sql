-- Create knowledge base table
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'document', 'image')),
  file_name TEXT,
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view knowledge base for their projects" 
ON public.knowledge_base 
FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create knowledge base for their projects" 
ON public.knowledge_base 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update knowledge base for their projects" 
ON public.knowledge_base 
FOR UPDATE 
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete knowledge base for their projects" 
ON public.knowledge_base 
FOR DELETE 
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

-- Add node context column to projects table for storing node-specific context
ALTER TABLE public.projects 
ADD COLUMN node_contexts JSONB DEFAULT '{}';

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for knowledge base files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-base', 'knowledge-base', false);

-- Create storage policies
CREATE POLICY "Users can upload knowledge base files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'knowledge-base' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their knowledge base files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'knowledge-base' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their knowledge base files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'knowledge-base' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their knowledge base files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'knowledge-base' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);