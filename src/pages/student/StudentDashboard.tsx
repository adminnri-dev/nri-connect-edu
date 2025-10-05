import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LogOut, FileText, Calendar, Bell, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LibraryView } from '@/components/student/LibraryView';
import { TimetableView } from '@/components/student/TimetableView';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import AnnouncementsList from '@/components/AnnouncementsList';

interface Grade {
  assignment_name: string;
  assignment_type: string;
  score: number;
  max_score: number;
  date: string;
  notes: string | null;
  class_name: string;
}

interface Attendance {
  date: string;
  status: 'present' | 'absent' | 'late';
  notes: string | null;
  class_name: string;
}

interface Announcement {
  title: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  published_at: string;
}

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const [gradesRes, attendanceRes, announcementsRes] = await Promise.all([
        supabase.from('grades').select('*').eq('student_id', user?.id).order('date', { ascending: false }).limit(20),
        supabase.from('attendance').select('*').eq('student_id', user?.id).order('date', { ascending: false }).limit(20),
        supabase.from('announcements').select('title, content, priority, published_at')
          .eq('published', true)
          .or('target_audience.eq.all,target_audience.eq.students')
          .order('published_at', { ascending: false })
          .limit(10)
      ]);

      if (gradesRes.error) throw gradesRes.error;
      if (attendanceRes.error) throw attendanceRes.error;
      if (announcementsRes.error) throw announcementsRes.error;

      // Fetch class names for grades
      const classIds = [...new Set(gradesRes.data?.map(g => g.class_id))];
      const { data: classes } = await supabase.from('classes').select('id, name, section').in('id', classIds);
      const classMap = new Map(classes?.map(c => [c.id, `${c.name} - ${c.section}`]));

      const gradesWithClass = gradesRes.data?.map(g => ({
        assignment_name: g.assignment_name,
        assignment_type: g.assignment_type,
        score: g.score,
        max_score: g.max_score,
        date: g.date,
        notes: g.notes,
        class_name: classMap.get(g.class_id) || 'Unknown'
      })) || [];

      // Fetch class names for attendance
      const attClassIds = [...new Set(attendanceRes.data?.map(a => a.class_id))];
      const { data: attClasses } = await supabase.from('classes').select('id, name, section').in('id', attClassIds);
      const attClassMap = new Map(attClasses?.map(c => [c.id, `${c.name} - ${c.section}`]));

      const attendanceWithClass = attendanceRes.data?.map(a => ({
        date: a.date,
        status: a.status as 'present' | 'absent' | 'late',
        notes: a.notes,
        class_name: attClassMap.get(a.class_id) || 'Unknown'
      })) || [];

      setGrades(gradesWithClass);
      setAttendance(attendanceWithClass);
      setAnnouncements(announcementsRes.data as Announcement[] || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(1);
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late': return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline'> = {
      normal: 'outline',
      high: 'default',
      urgent: 'destructive'
    };
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  const calculateAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    return total > 0 ? ((present / total) * 100).toFixed(1) : '0';
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return '0';
    const avg = grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length;
    return avg.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <Button variant="ghost" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="mb-8">
          <AnnouncementsList userRole="student" />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading your data...</div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAverageGrade()}%</div>
                  <p className="text-xs text-muted-foreground">Based on {grades.length} assignments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAttendanceStats()}%</div>
                  <p className="text-xs text-muted-foreground">{attendance.length} records</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Announcements</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{announcements.length}</div>
                  <p className="text-xs text-muted-foreground">Unread messages</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="grades" className="space-y-6">
              <TabsList>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="timetable">Timetable</TabsTrigger>
                <TabsTrigger value="library">Library</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="grades">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Grades</CardTitle>
                    <CardDescription>View your assignment scores and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grades.map((grade, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{grade.assignment_name}</TableCell>
                            <TableCell className="capitalize">{grade.assignment_type}</TableCell>
                            <TableCell>{grade.class_name}</TableCell>
                            <TableCell>
                              {grade.score}/{grade.max_score} ({calculatePercentage(grade.score, grade.max_score)}%)
                            </TableCell>
                            <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                        {grades.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No grades available yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                    <CardDescription>Track your attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.map((record, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.class_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getAttendanceIcon(record.status)}
                                <span className="capitalize">{record.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{record.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                        {attendance.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No attendance records yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timetable">
                <TimetableView />
              </TabsContent>

              <TabsContent value="library">
                <LibraryView />
              </TabsContent>

              <TabsContent value="announcements">
                <Card>
                  <CardHeader>
                    <CardTitle>School Announcements</CardTitle>
                    <CardDescription>Important updates and messages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {announcements.map((announcement, idx) => (
                      <div key={idx} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          {getPriorityBadge(announcement.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <p className="text-center text-muted-foreground">No announcements available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <ProfileSettings />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
