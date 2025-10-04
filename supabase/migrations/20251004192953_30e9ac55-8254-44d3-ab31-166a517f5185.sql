-- Parent-Student Links Table
CREATE TABLE public.parent_student_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL,
  student_user_id UUID NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, student_user_id)
);

ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their linked students"
ON public.parent_student_links
FOR SELECT
USING (auth.uid() = parent_user_id);

CREATE POLICY "Admins can manage parent-student links"
ON public.parent_student_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Report Cards Table
CREATE TABLE public.report_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  class_id UUID NOT NULL,
  overall_grade TEXT,
  overall_percentage NUMERIC,
  teacher_comments TEXT,
  principal_comments TEXT,
  generated_by UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own report cards"
ON public.report_cards
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Parents can view their children's report cards"
ON public.report_cards
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.parent_student_links
  WHERE parent_user_id = auth.uid() AND student_user_id = report_cards.student_id
));

CREATE POLICY "Teachers and admins can manage report cards"
ON public.report_cards
FOR ALL
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Student Enrollments Table
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own enrollments"
ON public.student_enrollments
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrollments for their classes"
ON public.student_enrollments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.classes
  WHERE classes.id = student_enrollments.class_id AND classes.teacher_id = auth.uid()
));

CREATE POLICY "Admins can manage enrollments"
ON public.student_enrollments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timetable/Schedule Table
CREATE TABLE public.timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  room_number TEXT,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view timetable"
ON public.timetable
FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage timetable for their classes"
ON public.timetable
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = timetable.class_id AND classes.teacher_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_report_cards_updated_at
BEFORE UPDATE ON public.report_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_enrollments_updated_at
BEFORE UPDATE ON public.student_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_updated_at
BEFORE UPDATE ON public.timetable
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();