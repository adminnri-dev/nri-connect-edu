-- Create events table for school calendar
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'general',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  target_audience TEXT NOT NULL DEFAULT 'all',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view events for their audience"
ON public.events
FOR SELECT
USING (
  (target_audience = 'all') OR
  (target_audience = 'students' AND has_role(auth.uid(), 'student'::app_role)) OR
  (target_audience = 'teachers' AND has_role(auth.uid(), 'teacher'::app_role)) OR
  (target_audience = 'admins' AND has_role(auth.uid(), 'admin'::app_role)) OR
  (target_audience = 'parents')
);

CREATE POLICY "Admins and teachers can create events"
ON public.events
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

CREATE POLICY "Admins and event creators can update events"
ON public.events
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  created_by = auth.uid()
);

CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_events_target_audience ON public.events(target_audience);