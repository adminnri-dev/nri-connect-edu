import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Users, GraduationCap, DollarSign, FileText, Calendar } from 'lucide-react';
import { ChildGrades } from '@/components/parent/ChildGrades';
import { ChildAttendance } from '@/components/parent/ChildAttendance';
import { ChildFees } from '@/components/parent/ChildFees';
import { ChildReportCards } from '@/components/parent/ChildReportCards';
import { ParentDashboardStats } from '@/components/parent/ParentDashboardStats';
import { MessagesList } from '@/components/messaging/MessagesList';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import AnnouncementsList from '@/components/AnnouncementsList';
import { NotificationBell } from '@/components/NotificationBell';
import { SchoolCalendar } from '@/components/SchoolCalendar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ParentSidebar } from '@/components/parent/ParentSidebar';
import { LogoWatermark } from '@/components/LogoWatermark';

export default function ParentDashboard() {
  const { user, signOut } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('parent_student_links')
        .select('student_user_id, relationship')
        .eq('parent_user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const studentIds = data.map(link => link.student_user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', studentIds);

        if (profilesError) throw profilesError;

        const childrenData = (profiles || []).map(profile => ({
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          relationship: data.find(l => l.student_user_id === profile.user_id)?.relationship || ''
        }));

        setChildren(childrenData);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].user_id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedChildData = children.find(child => child.user_id === selectedChild);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-accent/20">
          <LogoWatermark opacity={0.03} size="600px" />
          <ParentSidebar />
          <div className="flex-1 flex flex-col relative z-10">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Parent Portal</h1>
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
            <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No Children Linked</CardTitle>
              <CardDescription>
                Please contact the school administrator to link your children to your account.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-accent/20">
        <LogoWatermark opacity={0.03} size="600px" />
        <ParentSidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Parent Portal</h1>
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
          <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Child
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.user_id} value={child.user_id}>
                      {child.full_name} ({child.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <AnnouncementsList userRole="parent" />
        </div>

        <ParentDashboardStats />

        {selectedChildData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="reports">Report Cards</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Student</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{selectedChildData.full_name}</div>
                    <p className="text-xs text-muted-foreground">{selectedChildData.email}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Relationship</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold capitalize">{selectedChildData.relationship}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Download Report Card
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>About This Portal</CardTitle>
                  <CardDescription>Access your child's academic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    Welcome to the Parent Portal! Here you can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>View your child's grades and assignments</li>
                    <li>Check attendance records</li>
                    <li>Monitor fee payments and dues</li>
                    <li>Download report cards</li>
                    <li>View school announcements</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades">
              <ChildGrades studentId={selectedChild} />
            </TabsContent>

            <TabsContent value="attendance">
              <ChildAttendance studentId={selectedChild} />
            </TabsContent>

            <TabsContent value="fees">
              <ChildFees studentId={selectedChild} />
            </TabsContent>

            <TabsContent value="reports">
              <ChildReportCards studentId={selectedChild} />
            </TabsContent>

            <TabsContent value="calendar">
              <SchoolCalendar />
            </TabsContent>

            <TabsContent value="messages">
              <MessagesList />
            </TabsContent>

            <TabsContent value="settings">
              <ProfileSettings />
            </TabsContent>
          </Tabs>
        )}
      </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
