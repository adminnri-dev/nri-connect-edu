-- Fix critical security vulnerabilities in RLS policies

-- ============================================================================
-- 1. FIX PROFILES TABLE EXPOSURE
-- ============================================================================

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON public.profiles;

-- Create helper function to check if a teacher teaches a student
CREATE OR REPLACE FUNCTION public.teacher_teaches_student(_teacher_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM student_enrollments se
    INNER JOIN classes c ON c.id = se.class_id
    WHERE c.teacher_id = _teacher_id
      AND se.student_id = _student_id
      AND se.status = 'active'
  )
$$;

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Teachers can ONLY view profiles of students they actively teach
CREATE POLICY "Teachers can view their students profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher') 
  AND teacher_teaches_student(auth.uid(), user_id)
);

-- ============================================================================
-- 2. FIX STUDENT_PROFILES PARENT CONTACT EXPOSURE
-- ============================================================================

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Admins and teachers can view all student profiles" ON public.student_profiles;

-- Admins can view all student profiles
CREATE POLICY "Admins can view all student profiles"
ON public.student_profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Teachers can ONLY view student profiles for students they teach
CREATE POLICY "Teachers can view their students profiles only"
ON public.student_profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher')
  AND teacher_teaches_student(auth.uid(), user_id)
);

-- ============================================================================
-- 3. FIX AUDIT_LOGS UNRESTRICTED INSERT
-- ============================================================================

-- Drop the dangerous "true" policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create secure audit log insertion function
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  _action text,
  _resource_type text,
  _resource_id uuid DEFAULT NULL,
  _details jsonb DEFAULT NULL,
  _ip_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address
  )
  VALUES (
    auth.uid(),
    _action,
    _resource_type,
    _resource_id,
    _details,
    _ip_address
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Grant execute permission only to authenticated users (function enforces security)
GRANT EXECUTE ON FUNCTION public.insert_audit_log TO authenticated;

-- Only allow INSERT through the security definer function (no direct INSERT policy)
-- This prevents users from inserting fake audit entries

-- ============================================================================
-- 4. ADDITIONAL SECURITY HARDENING
-- ============================================================================

-- Add index for performance on teacher-student lookups
CREATE INDEX IF NOT EXISTS idx_student_enrollments_teacher_lookup 
ON public.student_enrollments(student_id, class_id) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_classes_teacher_id 
ON public.classes(teacher_id);

-- Prevent role escalation by ensuring user_roles UPDATE is restricted
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Add policy to prevent users from granting themselves admin access
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add rate limiting helper for future use
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _action text,
  _max_attempts integer,
  _window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _attempt_count integer;
BEGIN
  SELECT COUNT(*)
  INTO _attempt_count
  FROM audit_logs
  WHERE user_id = _user_id
    AND action = _action
    AND created_at > (now() - (_window_minutes || ' minutes')::interval);
  
  RETURN _attempt_count < _max_attempts;
END;
$$;