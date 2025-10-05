-- Create fee structure table
CREATE TABLE public.fee_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  fee_type TEXT NOT NULL, -- tuition, transport, library, lab, etc.
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, annual, one-time
  due_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student fees table (tracks what each student owes)
CREATE TABLE public.student_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, partial, paid, overdue
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fee payments table (tracks all payments)
CREATE TABLE public.fee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL, -- cash, upi, card, cheque, bank_transfer
  payment_reference TEXT, -- UPI transaction ID, cheque number, etc.
  receipt_number TEXT NOT NULL UNIQUE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by UUID NOT NULL, -- admin who recorded the payment
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_structures
CREATE POLICY "Admins can manage fee structures"
ON public.fee_structures FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view fee structures"
ON public.fee_structures FOR SELECT
USING (true);

-- RLS Policies for student_fees
CREATE POLICY "Admins can manage student fees"
ON public.student_fees FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their own fees"
ON public.student_fees FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Parents can view their children's fees"
ON public.student_fees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_student_links
    WHERE parent_user_id = auth.uid() 
    AND student_user_id = student_fees.student_id
  )
);

CREATE POLICY "Teachers can view fees for their class students"
ON public.student_fees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = student_fees.student_id
    AND c.teacher_id = auth.uid()
  )
);

-- RLS Policies for fee_payments
CREATE POLICY "Admins can manage payments"
ON public.fee_payments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their own payments"
ON public.fee_payments FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Parents can view their children's payments"
ON public.fee_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_student_links
    WHERE parent_user_id = auth.uid() 
    AND student_user_id = fee_payments.student_id
  )
);

-- Create indexes for better performance
CREATE INDEX idx_student_fees_student_id ON public.student_fees(student_id);
CREATE INDEX idx_student_fees_status ON public.student_fees(status);
CREATE INDEX idx_fee_payments_student_id ON public.fee_payments(student_id);
CREATE INDEX idx_fee_payments_receipt_number ON public.fee_payments(receipt_number);

-- Create trigger for updated_at
CREATE TRIGGER update_fee_structures_updated_at
BEFORE UPDATE ON public.fee_structures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at
BEFORE UPDATE ON public.student_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();