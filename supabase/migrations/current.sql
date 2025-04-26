
-- Update training_modules table to ensure all required columns exist
DO $$
BEGIN
  -- Add name column if not exists
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name='training_modules' AND column_name='name') THEN
    ALTER TABLE public.training_modules ADD COLUMN name TEXT;
  END IF;

  -- Add description column if not exists
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name='training_modules' AND column_name='description') THEN
    ALTER TABLE public.training_modules ADD COLUMN description TEXT;
  END IF;

  -- Add tags column if not exists
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name='training_modules' AND column_name='tags') THEN
    ALTER TABLE public.training_modules ADD COLUMN tags TEXT[];
  END IF;

  -- Add status column with check constraint
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name='training_modules' AND column_name='status') THEN
    ALTER TABLE public.training_modules 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive'));
  END IF;

  -- Add thumbnail column if not exists
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name='training_modules' AND column_name='thumbnail') THEN
    ALTER TABLE public.training_modules ADD COLUMN thumbnail TEXT;
  END IF;
END $$;

-- Create table for module-video relationships with ordering if not exists
CREATE TABLE IF NOT EXISTS public.module_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (module_id, video_id)
);

-- Create table for module-assessment relationships with ordering if not exists
CREATE TABLE IF NOT EXISTS public.module_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (module_id, assessment_id)
);

-- Create table for job-module relationships if not exists
CREATE TABLE IF NOT EXISTS public.job_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (job_id, module_id)
);

-- Update training_progress table to track more information
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name='training_progress' AND column_name='started_at') THEN
    ALTER TABLE public.training_progress 
    ADD COLUMN started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ADD COLUMN time_spent INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add a trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables that need updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT trigger_name 
                 FROM information_schema.triggers 
                 WHERE event_object_table = 'training_modules' 
                 AND trigger_name = 'set_updated_at_training_modules') THEN
    CREATE TRIGGER set_updated_at_training_modules
    BEFORE UPDATE ON public.training_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins and HR can read all training modules
CREATE OR REPLACE POLICY "Admins and HR can read all training modules"
ON public.training_modules
FOR SELECT
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'hr', 'manager')
);

-- Anyone can read active training modules
CREATE OR REPLACE POLICY "Anyone can read active training modules"
ON public.training_modules
FOR SELECT
USING (status = 'active');

-- Only admins and HR can create/update/delete training modules
CREATE OR REPLACE POLICY "Only admins and HR can create training modules"
ON public.training_modules
FOR INSERT
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('admin', 'hr')
);

CREATE OR REPLACE POLICY "Only admins and HR can update training modules"
ON public.training_modules
FOR UPDATE
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'hr')
);

CREATE OR REPLACE POLICY "Only admins and HR can delete training modules"
ON public.training_modules
FOR DELETE
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'hr')
);

-- Policies for module relationships
CREATE OR REPLACE POLICY "Anyone can read module videos"
ON public.module_videos
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Only admins and HR can manage module videos"
ON public.module_videos
FOR ALL
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'hr')
);

CREATE OR REPLACE POLICY "Anyone can read module assessments"
ON public.module_assessments
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Only admins and HR can manage module assessments"
ON public.module_assessments
FOR ALL
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'hr')
);

CREATE OR REPLACE POLICY "Anyone can read job modules"
ON public.job_modules
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Only admins and HR can manage job modules"
ON public.job_modules
FOR ALL
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'hr')
);
