
-- RPC for counting module assessments
CREATE OR REPLACE FUNCTION public.count_module_assessments(assessment_id_param UUID)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::int 
    FROM module_assessments 
    WHERE assessment_id = assessment_id_param
  );
END;
$$;

-- RPC for getting module videos
CREATE OR REPLACE FUNCTION public.get_module_videos(module_id_param UUID)
RETURNS TABLE (
  id UUID,
  module_id UUID,
  video_id UUID,
  "order" INT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT mv.id, mv.module_id, mv.video_id, mv."order", mv.created_at
  FROM module_videos mv
  WHERE mv.module_id = module_id_param
  ORDER BY mv."order";
END;
$$;

-- RPC for getting module assessments
CREATE OR REPLACE FUNCTION public.get_module_assessments(module_id_param UUID)
RETURNS TABLE (
  id UUID,
  module_id UUID,
  assessment_id UUID,
  "order" INT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ma.id, ma.module_id, ma.assessment_id, ma."order", ma.created_at
  FROM module_assessments ma
  WHERE ma.module_id = module_id_param
  ORDER BY ma."order";
END;
$$;

-- RPC for creating module videos
CREATE OR REPLACE FUNCTION public.create_module_videos(
  module_id_param UUID,
  video_ids_param UUID[],
  orders_param INT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..array_length(video_ids_param, 1)
  LOOP
    INSERT INTO module_videos (module_id, video_id, "order")
    VALUES (module_id_param, video_ids_param[i], orders_param[i]);
  END LOOP;
END;
$$;

-- RPC for creating module assessments
CREATE OR REPLACE FUNCTION public.create_module_assessments(
  module_id_param UUID,
  assessment_ids_param UUID[],
  orders_param INT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..array_length(assessment_ids_param, 1)
  LOOP
    INSERT INTO module_assessments (module_id, assessment_id, "order")
    VALUES (module_id_param, assessment_ids_param[i], orders_param[i]);
  END LOOP;
END;
$$;

-- RPC for deleting module videos
CREATE OR REPLACE FUNCTION public.delete_module_videos(module_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM module_videos WHERE module_id = module_id_param;
END;
$$;

-- RPC for deleting module assessments
CREATE OR REPLACE FUNCTION public.delete_module_assessments(module_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM module_assessments WHERE module_id = module_id_param;
END;
$$;
