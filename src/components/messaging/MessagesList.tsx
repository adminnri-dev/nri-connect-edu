import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MailOpen, Send, Search, Trash2, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { MessageCompose } from './MessageCompose';
import { MessageView } from './MessageView';

export function MessagesList() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [viewMessageOpen, setViewMessageOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      // Fetch inbox
      const { data: inboxData, error: inboxError } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(full_name, email)')
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false });

      if (inboxError) throw inboxError;

      // Fetch sent messages
      const { data: sentData, error: sentError } = await supabase
        .from('messages')
        .select('*, recipient:profiles!messages_recipient_id_fkey(full_name, email)')
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      setInbox(inboxData || []);
      setSent(sentData || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      
      await fetchMessages();
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      await fetchMessages();
    } catch (error: any) {
      console.error('Error deleting message:', error);
    }
  };

  const openMessage = (message: any) => {
    setSelectedMessage(message);
    setViewMessageOpen(true);
    if (!message.read && message.recipient_id === user?.id) {
      markAsRead(message.id);
    }
  };

  const handleReply = (recipientId: string) => {
    setViewMessageOpen(false);
    setComposeOpen(true);
  };

  const filterMessages = (messages: any[]) => {
    return messages.filter(msg =>
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const unreadCount = inbox.filter(msg => !msg.read).length;

  if (loading) {
    return <Card><CardContent className="pt-6">Loading messages...</CardContent></Card>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Send and receive messages with other users</CardDescription>
            </div>
            <Button onClick={() => setComposeOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="inbox" className="space-y-4">
            <TabsList>
              <TabsTrigger value="inbox" className="relative">
                Inbox
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox">
              <div className="space-y-2">
                {filterMessages(inbox).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages in inbox
                  </div>
                ) : (
                  filterMessages(inbox).map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        !message.read ? 'bg-accent/50' : ''
                      }`}
                      onClick={() => openMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {message.read ? (
                            <MailOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                          ) : (
                            <Mail className="h-5 w-5 text-primary mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                {message.sender?.full_name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <h4 className={`${!message.read ? 'font-semibold' : ''}`}>
                              {message.subject}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {message.content}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent">
              <div className="space-y-2">
                {filterMessages(sent).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sent messages
                  </div>
                ) : (
                  filterMessages(sent).map((message) => (
                    <div
                      key={message.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => openMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Send className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                To: {message.recipient?.full_name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <h4>{message.subject}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {message.content}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <MessageCompose
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSent={fetchMessages}
      />

      {selectedMessage && (
        <MessageView
          message={selectedMessage}
          open={viewMessageOpen}
          onOpenChange={setViewMessageOpen}
          onReply={handleReply}
        />
      )}
    </>
  );
}