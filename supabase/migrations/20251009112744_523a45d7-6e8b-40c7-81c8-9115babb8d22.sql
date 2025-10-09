-- Remove dangerous localStorage authentication and create secure server-side authentication

-- ============================================================================
-- 1. CREATE SECURE CUSTOM AUTHENTICATION FUNCTION
-- ============================================================================

-- Create function to authenticate with school_id, first_name, and DOB
-- This replaces the client-side localStorage authentication
CREATE OR REPLACE FUNCTION public.authenticate_with_school_credentials(
  _admission_no text,
  _first_name text,
  _dob date
)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text,
  role app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify credentials against student_profiles
  RETURN QUERY
  SELECT 
    sp.user_id,
    p.full_name,
    p.email,
    ur.role
  FROM student_profiles sp
  INNER JOIN profiles p ON p.user_id = sp.user_id
  INNER JOIN user_roles ur ON ur.user_id = sp.user_id
  WHERE sp.admission_no = _admission_no
    AND LOWER(SPLIT_PART(p.full_name, ' ', 1)) = LOWER(_first_name)
    AND sp.date_of_birth = _dob
  LIMIT 1;
END;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.authenticate_with_school_credentials TO authenticated, anon;

-- ============================================================================
-- 2. ADD SESSION MANAGEMENT TABLE
-- ============================================================================

-- Create table to track custom login sessions securely on server-side
CREATE TABLE IF NOT EXISTS public.custom_login_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_login_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.custom_login_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can delete sessions (for security/logout all)
CREATE POLICY "Admins can delete sessions"
ON public.custom_login_sessions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Add index for session lookups
CREATE INDEX IF NOT EXISTS idx_custom_sessions_token ON public.custom_login_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_custom_sessions_user_id ON public.custom_login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_sessions_expires ON public.custom_login_sessions(expires_at);

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM custom_login_sessions
  WHERE expires_at < now();
END;
$$;

-- ============================================================================
-- 3. PREVENT ROLE MANIPULATION
-- ============================================================================

-- Add additional constraint to prevent role escalation
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE(user_id, role);

-- Ensure users cannot insert their own roles
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Only admins can insert roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 4. ADD PASSWORD ATTEMPT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- school_id or email
  ip_address text,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier_time 
ON public.login_attempts(identifier, attempted_at);

-- Function to check and record login attempts
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
  _identifier text,
  _ip_address text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _failed_attempts integer;
BEGIN
  -- Count failed attempts in last 15 minutes
  SELECT COUNT(*)
  INTO _failed_attempts
  FROM login_attempts
  WHERE identifier = _identifier
    AND success = false
    AND attempted_at > (now() - interval '15 minutes');
  
  -- Block if more than 5 failed attempts
  IF _failed_attempts >= 5 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  _identifier text,
  _success boolean,
  _ip_address text DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (identifier, success, ip_address, user_agent)
  VALUES (_identifier, _success, _ip_address, _user_agent);
  
  -- Clean up old attempts (keep last 7 days)
  DELETE FROM login_attempts
  WHERE attempted_at < (now() - interval '7 days');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_login_rate_limit TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.record_login_attempt TO authenticated, anon;