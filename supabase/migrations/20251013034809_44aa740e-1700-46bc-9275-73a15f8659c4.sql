-- Fix critical security issue: Prevent unauthenticated access to profiles table
-- This adds a RESTRICTIVE policy that requires authentication as the base layer
-- Existing PERMISSIVE policies still control fine-grained access based on roles

CREATE POLICY "Authentication required for profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Fix critical security issue: Prevent unauthenticated access to student_profiles table
-- This protects parent contact information from being accessed by strangers

CREATE POLICY "Authentication required for student_profiles"
ON public.student_profiles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Additional security: Ensure parent_student_links requires authentication
CREATE POLICY "Authentication required for parent_student_links"
ON public.parent_student_links
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Ensure custom_login_sessions requires authentication
CREATE POLICY "Authentication required for custom_login_sessions"
ON public.custom_login_sessions
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);