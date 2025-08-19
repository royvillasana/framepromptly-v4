-- Create projects table for user workspaces
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  canvas_data JSONB DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Create prompts table for storing generated prompts
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  framework_name TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  ai_response TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for prompts
CREATE POLICY "Users can view their own prompts"
ON public.prompts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts"
ON public.prompts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
ON public.prompts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
ON public.prompts
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on prompts
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();