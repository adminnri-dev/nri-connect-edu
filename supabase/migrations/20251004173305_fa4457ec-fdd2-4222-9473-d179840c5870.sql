-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(name, section, academic_year)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(student_id, class_id, date)
);

-- Create grades table
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  assignment_name TEXT NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('homework', 'quiz', 'test', 'project', 'exam')),
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers', 'admins', 'parents')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create audit_logs table for admin actions
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Everyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for classes
CREATE POLICY "Everyone can view classes"
  ON public.classes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage classes"
  ON public.classes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view their classes"
  ON public.classes FOR SELECT
  USING (auth.uid() = teacher_id);

-- RLS Policies for attendance
CREATE POLICY "Students can view their own attendance"
  ON public.attendance FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view and manage attendance for their classes"
  ON public.attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = attendance.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all attendance"
  ON public.attendance FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for grades
CREATE POLICY "Students can view their own grades"
  ON public.grades FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage grades for their classes"
  ON public.grades FOR ALL
  USING (
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = grades.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all grades"
  ON public.grades FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for announcements
CREATE POLICY "Published announcements visible to target audience"
  ON public.announcements FOR SELECT
  USING (
    published = true AND
    (expires_at IS NULL OR expires_at > now()) AND
    (
      target_audience = 'all' OR
      (target_audience = 'students' AND public.has_role(auth.uid(), 'student')) OR
      (target_audience = 'teachers' AND public.has_role(auth.uid(), 'teacher')) OR
      (target_audience = 'admins' AND public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins and teachers can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Admins and teachers can update their announcements"
  ON public.announcements FOR UPDATE
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete announcements"
  ON public.announcements FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grades_updated_at
  BEFORE UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();