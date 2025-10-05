-- Create book categories enum
CREATE TYPE public.book_category AS ENUM (
  'fiction',
  'non_fiction',
  'science',
  'mathematics',
  'history',
  'literature',
  'reference',
  'magazine',
  'other'
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category book_category NOT NULL,
  publisher TEXT,
  published_year INTEGER,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book borrowings table
CREATE TABLE public.book_borrowings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  issued_by UUID NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  returned_to UUID,
  status TEXT NOT NULL DEFAULT 'borrowed', -- borrowed, returned, overdue
  fine_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_borrowings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Everyone can view books"
ON public.books FOR SELECT
USING (true);

CREATE POLICY "Admins can manage books"
ON public.books FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for book_borrowings
CREATE POLICY "Admins can manage borrowings"
ON public.book_borrowings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their own borrowings"
ON public.book_borrowings FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view borrowings"
ON public.book_borrowings FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Parents can view their children's borrowings"
ON public.book_borrowings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_student_links
    WHERE parent_user_id = auth.uid() 
    AND student_user_id = book_borrowings.student_id
  )
);

-- Create indexes
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_book_borrowings_student_id ON public.book_borrowings(student_id);
CREATE INDEX idx_book_borrowings_status ON public.book_borrowings(status);
CREATE INDEX idx_book_borrowings_due_date ON public.book_borrowings(due_date);

-- Create triggers
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_borrowings_updated_at
BEFORE UPDATE ON public.book_borrowings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update book availability when borrowing
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease available copies when book is borrowed
    UPDATE public.books
    SET available_copies = available_copies - 1
    WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'borrowed' AND NEW.status = 'returned' THEN
    -- Increase available copies when book is returned
    UPDATE public.books
    SET available_copies = available_copies + 1
    WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_book_availability_trigger
AFTER INSERT OR UPDATE ON public.book_borrowings
FOR EACH ROW
EXECUTE FUNCTION update_book_availability();