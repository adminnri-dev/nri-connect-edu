import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, GraduationCap, BookOpen, TrendingUp, Calendar } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalCourses: 0,
    attendanceRate: 0,
    averageGrade: 0
  });
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch basic stats
      const [studentsRes, teachersRes, classesRes, coursesRes] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true })
      ]);

      // Fetch attendance rate
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('status');
      
      const totalAttendance = attendanceRecords?.length || 0;
      const presentCount = attendanceRecords?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      // Fetch average grade
      const { data: grades } = await supabase
        .from('grades')
        .select('score, max_score');
      
      const avgGrade = grades && grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length
        : 0;

      setStats({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalCourses: coursesRes.count || 0,
        attendanceRate: Math.round(attendanceRate),
        averageGrade: Math.round(avgGrade)
      });

      // Fetch enrollment trends by class
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('class_id, classes(name, section)')
        .eq('status', 'active');

      const enrollmentByClass = enrollments?.reduce((acc: any, enrollment: any) => {
        const className = enrollment.classes ? `${enrollment.classes.name} - ${enrollment.classes.section}` : 'Unknown';
        acc[className] = (acc[className] || 0) + 1;
        return acc;
      }, {});

      const enrollmentChartData = Object.entries(enrollmentByClass || {}).map(([name, count]) => ({
        name,
        students: count
      }));
      setEnrollmentData(enrollmentChartData);

      // Fetch attendance trends (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentAttendance } = await supabase
        .from('attendance')
        .select('date, status')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date');

      const attendanceByDate = recentAttendance?.reduce((acc: any, record: any) => {
        const date = record.date;
        if (!acc[date]) {
          acc[date] = { date, present: 0, absent: 0, late: 0 };
        }
        acc[date][record.status]++;
        return acc;
      }, {});

      const attendanceChartData = Object.values(attendanceByDate || {});
      setAttendanceData(attendanceChartData);

      // Fetch grade distribution
      const gradeRanges = [
        { name: 'A (90-100%)', min: 90, max: 100, count: 0 },
        { name: 'B (80-89%)', min: 80, max: 89, count: 0 },
        { name: 'C (70-79%)', min: 70, max: 79, count: 0 },
        { name: 'D (60-69%)', min: 60, max: 69, count: 0 },
        { name: 'F (0-59%)', min: 0, max: 59, count: 0 }
      ];

      grades?.forEach(grade => {
        const percentage = (grade.score / grade.max_score) * 100;
        const range = gradeRanges.find(r => percentage >= r.min && percentage <= r.max);
        if (range) range.count++;
      });

      setGradeDistribution(gradeRanges.filter(r => r.count > 0));

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade}%</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Available courses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment by Class</CardTitle>
              <CardDescription>Current enrollment distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends (Last 7 Days)</CardTitle>
              <CardDescription>Daily attendance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="absent" stroke="#FF8042" strokeWidth={2} />
                  <Line type="monotone" dataKey="late" stroke="#FFBB28" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>Distribution of student grades</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}