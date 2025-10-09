import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, BookOpen, Users, FileText, Calendar, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AttendanceManagement from '@/components/admin/AttendanceManagement';
import GradeManagement from '@/components/admin/GradeManagement';
import AnnouncementManagement from '@/components/admin/AnnouncementManagement';
import { BulkAttendanceMarking } from '@/components/teacher/BulkAttendanceMarking';
import { TeacherTimetableView } from '@/components/teacher/TeacherTimetableView';
import { MessagesList } from '@/components/messaging/MessagesList';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import AnnouncementsList from '@/components/AnnouncementsList';
import { NotificationBell } from '@/components/NotificationBell';
import { SchoolCalendar } from '@/components/SchoolCalendar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { LogoWatermark } from '@/components/LogoWatermark';

interface ClassData {
  id: string;
  name: string;
  section: string;
  academic_year: string;
}

export default function TeacherDashboard() {
  const { user, signOut, customUser } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && !customUser) {
      fetchTeacherData();
    } else if (customUser) {
      setLoading(false);
    }
  }, [user, customUser]);

  const fetchTeacherData = async () => {
    try {
      // Fetch classes assigned to this teacher
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name, section, academic_year')
        .eq('teacher_id', user?.id);

      if (classesError) throw classesError;

      setClasses(classesData || []);

      // Get total count of unique students across all classes
      const classIds = classesData?.map(c => c.id) || [];
      
      if (classIds.length > 0) {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('student_id')
          .in('class_id', classIds);

        if (attendanceError) throw attendanceError;

        const uniqueStudents = new Set(attendanceData?.map(a => a.student_id));
        setTotalStudents(uniqueStudents.size);
      }

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-accent/20">
        <LogoWatermark opacity={0.03} size="600px" />
        <TeacherSidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Button variant="ghost" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">
            Welcome{customUser ? `, ${customUser.firstName}` : ', Teacher'}!
          </h2>
          <p className="text-muted-foreground">
            {customUser ? `Teacher ID: ${customUser.id}` : user?.email}
          </p>
        </div>

        <div className="mb-8">
          <AnnouncementsList userRole="teacher" />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading your data...</div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.length}</div>
                  <p className="text-xs text-muted-foreground">Classes assigned to you</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Across all classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.filter(c => c.academic_year === new Date().getFullYear().toString()).length}</div>
                  <p className="text-xs text-muted-foreground">This academic year</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="classes" className="space-y-6">
              <TabsList>
                <TabsTrigger value="classes">My Classes</TabsTrigger>
                <TabsTrigger value="bulk-attendance">Bulk Attendance</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="timetable">Timetable</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="classes">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Classes</CardTitle>
                    <CardDescription>Classes assigned to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {classes.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No classes assigned yet. Contact your administrator.
                      </p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {classes.map((cls) => (
                          <Card key={cls.id}>
                            <CardHeader>
                              <CardTitle className="text-lg">{cls.name}</CardTitle>
                              <CardDescription>Section {cls.section}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Academic Year: {cls.academic_year}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bulk-attendance">
                <BulkAttendanceMarking />
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceManagement />
              </TabsContent>

              <TabsContent value="grades">
                <GradeManagement />
              </TabsContent>

              <TabsContent value="timetable">
                <TeacherTimetableView />
              </TabsContent>

              <TabsContent value="calendar">
                <SchoolCalendar />
              </TabsContent>

              <TabsContent value="announcements">
                <AnnouncementManagement />
              </TabsContent>

              <TabsContent value="messages">
                <MessagesList />
              </TabsContent>

              <TabsContent value="settings">
                <ProfileSettings />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
