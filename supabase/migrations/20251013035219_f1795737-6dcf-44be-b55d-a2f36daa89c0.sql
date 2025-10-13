-- Fix profiles table: Drop and recreate SELECT policies with explicit access control
-- This ensures users can only view their own profile, admins can view all, 
-- and teachers can only view their students' profiles

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view their students profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authentication required for profiles" ON public.profiles;

-- Recreate with explicit, secure policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view their assigned students profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher') 
  AND teacher_teaches_student(auth.uid(), user_id)
);

-- Fix custom_login_sessions: Users can only view their own sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.custom_login_sessions;
DROP POLICY IF EXISTS "Authentication required for custom_login_sessions" ON public.custom_login_sessions;

CREATE POLICY "Users can view only their own sessions"
ON public.custom_login_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
ON public.custom_login_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));