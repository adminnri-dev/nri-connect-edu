-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their sent messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view their received messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update their messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their sent messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- Indexes
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();