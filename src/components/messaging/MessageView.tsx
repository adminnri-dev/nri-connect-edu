import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Reply, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface MessageViewProps {
  message: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: (recipientId: string) => void;
}

export function MessageView({ message, open, onOpenChange, onReply }: MessageViewProps) {
  if (!message) return null;

  const senderName = message.sender?.full_name || 'Unknown';
  const recipientName = message.recipient?.full_name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{message.subject}</DialogTitle>
              <DialogDescription className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>
                    {message.sender_id ? `From: ${senderName}` : `To: ${recipientName}`}
                  </span>
                </div>
                <div className="text-xs">
                  {format(new Date(message.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                </div>
              </DialogDescription>
            </div>
            {message.sender_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onReply(message.sender_id);
                }}
              >
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}