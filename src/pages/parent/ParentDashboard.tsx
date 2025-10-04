import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Calendar, FileText, GraduationCap } from 'lucide-react';

interface LinkedStudent {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
}

interface Attendance {
  id: string;
  date: string;
  status: string;
  notes: string | null;
}

interface Grade {
  id: string;
  assignment_name: string;
  assignment_type: string;
  score: number;
  max_score: number;
  date: string;
}

interface ReportCard {
  id: string;
  academic_year: string;
  term: string;
  overall_grade: string | null;
  overall_percentage: number | null;
  teacher_comments: string | null;
  generated_at: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchLinkedStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchLinkedStudents = async () => {
    try {
      const { data: links, error: linksError } = await supabase
        .from('parent_student_links')
        .select('student_user_id, relationship')
        .eq('parent_user_id', user?.id);

      if (linksError) throw linksError;

      if (links && links.length > 0) {
        const studentIds = links.map(link => link.student_user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', studentIds);

        if (profilesError) throw profilesError;

        const enrichedStudents = (profiles || []).map(profile => ({
          id: profile.user_id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          relationship: links.find(l => l.student_user_id === profile.user_id)?.relationship || '',
        }));

        setLinkedStudents(enrichedStudents);
        if (enrichedStudents.length > 0) {
          setSelectedStudent(enrichedStudents[0].user_id);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      // Fetch attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(10);

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData || []);

      // Fetch grades
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(10);

      if (gradesError) throw gradesError;
      setGrades(gradesData || []);

      // Fetch report cards
      const { data: reportCardsData, error: reportCardsError } = await supabase
        .from('report_cards')
        .select('*')
        .eq('student_id', studentId)
        .order('generated_at', { ascending: false });

      if (reportCardsError) throw reportCardsError;
      setReportCards(reportCardsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (linkedStudents.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <Card>
          <CardHeader>
            <CardTitle>Parent Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No students linked to your account. Please contact the school administration to link your child's account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStudent = linkedStudents.find(s => s.user_id === selectedStudent);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Parent Portal</h1>
          <p className="text-muted-foreground">View your child's academic information</p>
        </div>

        {linkedStudents.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {linkedStudents.map(student => (
                  <button
                    key={student.user_id}
                    onClick={() => setSelectedStudent(student.user_id)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedStudent === student.user_id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {student.full_name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStudent && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Student</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStudent.full_name}</div>
                <p className="text-xs text-muted-foreground">{currentStudent.relationship}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Report Cards</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportCards.length}</div>
                <p className="text-xs text-muted-foreground">Available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{grades.length}</div>
                <p className="text-xs text-muted-foreground">Assignments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendance.filter(a => a.status === 'present').length}/{attendance.length}
                </div>
                <p className="text-xs text-muted-foreground">Present</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="grades" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="reports">Report Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.assignment_name}</TableCell>
                        <TableCell>{grade.assignment_type}</TableCell>
                        <TableCell>
                          {grade.score}/{grade.max_score}
                        </TableCell>
                        <TableCell>
                          {((grade.score / grade.max_score) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status}
                          </span>
                        </TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Report Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>{card.academic_year}</TableCell>
                        <TableCell>{card.term}</TableCell>
                        <TableCell>{card.overall_grade || '-'}</TableCell>
                        <TableCell>{card.overall_percentage ? `${card.overall_percentage}%` : '-'}</TableCell>
                        <TableCell>{new Date(card.generated_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
