
-- Check if companies table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'companies' AND schemaname = 'public') THEN
        CREATE TABLE public.companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            domain TEXT,
            logo TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Add RLS to companies table
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Check if company_admins table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'company_admins' AND schemaname = 'public') THEN
        CREATE TABLE public.company_admins (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            company_id UUID NOT NULL REFERENCES public.companies(id),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Add RLS to company_admins table
        ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Check if company_id column exists in profiles table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles'
                   AND column_name = 'company_id') THEN
        ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
END
$$;

-- Check if is_public column exists in jobs table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'jobs'
                   AND column_name = 'is_public') THEN
        ALTER TABLE public.jobs ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;
    END IF;
END
$$;

-- Create or replace get_user_company function
CREATE OR REPLACE FUNCTION public.get_user_company()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create or replace is_company_admin function
CREATE OR REPLACE FUNCTION public.is_company_admin(company_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_admins
    WHERE company_id = company_uuid AND user_id = user_uuid
  );
END;
$$;

-- Add company related policies
DO $$
BEGIN
    -- Create company policies if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can view their own company') THEN
        CREATE POLICY "Users can view their own company" ON public.companies
            FOR SELECT USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Company admins can update their companies') THEN
        CREATE POLICY "Company admins can update their companies" ON public.companies
            FOR UPDATE USING (public.is_company_admin(id));
    END IF;

    -- Create company_admins policies if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'company_admins' AND policyname = 'Admin users can view company admins') THEN
        CREATE POLICY "Admin users can view company admins" ON public.company_admins
            FOR SELECT USING (public.is_admin(auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'company_admins' AND policyname = 'Company admins can view their own company admins') THEN
        CREATE POLICY "Company admins can view their own company admins" ON public.company_admins
            FOR SELECT USING (public.is_company_admin(company_id));
    END IF;
END
$$;
