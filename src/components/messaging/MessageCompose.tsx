import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

interface MessageComposeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId?: string;
  onSent?: () => void;
}

export function MessageCompose({ open, onOpenChange, recipientId, onSent }: MessageComposeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    recipient_id: recipientId || '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (recipientId) {
      setFormData(prev => ({ ...prev, recipient_id: recipientId }));
    }
  }, [recipientId]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .neq('user_id', user?.id)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipient_id || !formData.subject || !formData.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user?.id,
          recipient_id: formData.recipient_id,
          subject: formData.subject,
          content: formData.content
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message sent successfully'
      });

      setFormData({
        recipient_id: recipientId || '',
        subject: '',
        content: ''
      });
      
      onOpenChange(false);
      if (onSent) onSent();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>Send a message to another user</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">To *</Label>
            <Select 
              value={formData.recipient_id} 
              onValueChange={(value) => setFormData({ ...formData, recipient_id: value })}
              disabled={!!recipientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter message subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Type your message here..."
              rows={8}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}