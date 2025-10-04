import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementsListProps {
  userRole?: 'student' | 'teacher' | 'admin' | 'parent';
}

export default function AnnouncementsList({ userRole }: AnnouncementsListProps) {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', userRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('published', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'normal':
        return <Info className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'normal':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
        </CardContent>
      </Card>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No announcements at this time</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Announcements
        </CardTitle>
        <CardDescription>Latest updates and important information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="border-l-4 border-primary pl-4 py-2 space-y-2 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                {getPriorityIcon(announcement.priority)}
                <div className="space-y-1">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              </div>
              <Badge variant={getPriorityColor(announcement.priority) as any}>
                {announcement.priority || 'normal'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {announcement.published_at &&
                  formatDistanceToNow(new Date(announcement.published_at), { addSuffix: true })}
              </span>
              <span className="capitalize">• {announcement.target_audience}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
