import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye } from 'lucide-react';

interface ReportCard {
  id: string;
  student_id: string;
  academic_year: string;
  term: string;
  class_id: string;
  overall_grade: string | null;
  overall_percentage: number | null;
  teacher_comments: string | null;
  principal_comments: string | null;
  generated_at: string;
  student_name?: string;
  class_name?: string;
}

export default function ReportCardManagement() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [term, setTerm] = useState('');
  const [overallGrade, setOverallGrade] = useState('');
  const [overallPercentage, setOverallPercentage] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const [principalComments, setPrincipalComments] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: reportCardsData, error: reportCardsError } = await supabase
        .from('report_cards')
        .select('*')
        .order('generated_at', { ascending: false });

      if (reportCardsError) throw reportCardsError;

      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*');

      if (classesError) throw classesError;
      setClasses(classesData || []);

      const enrichedReportCards = (reportCardsData || []).map(card => ({
        ...card,
        student_name: studentsData?.find(s => s.user_id === card.student_id)?.full_name,
        class_name: classesData?.find(c => c.id === card.class_id)?.name,
      }));

      setReportCards(enrichedReportCards);
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

  const handleGenerateReportCard = async () => {
    if (!selectedStudent || !selectedClass || !term) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('report_cards')
        .insert({
          student_id: selectedStudent,
          class_id: selectedClass,
          academic_year: academicYear,
          term,
          overall_grade: overallGrade || null,
          overall_percentage: overallPercentage ? parseFloat(overallPercentage) : null,
          teacher_comments: teacherComments || null,
          principal_comments: principalComments || null,
          generated_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Report card generated successfully',
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setSelectedStudent('');
    setSelectedClass('');
    setTerm('');
    setOverallGrade('');
    setOverallPercentage('');
    setTeacherComments('');
    setPrincipalComments('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Report Card Management</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Report Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate New Report Card</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Student *</label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.user_id} value={student.user_id}>
                            {student.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Class *</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Academic Year</label>
                    <Input
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2024-2025"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Term *</label>
                    <Select value={term} onValueChange={setTerm}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">First Term</SelectItem>
                        <SelectItem value="Second Term">Second Term</SelectItem>
                        <SelectItem value="Third Term">Third Term</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Overall Grade</label>
                    <Select value={overallGrade} onValueChange={setOverallGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C+">C+</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Overall Percentage</label>
                    <Input
                      type="number"
                      value={overallPercentage}
                      onChange={(e) => setOverallPercentage(e.target.value)}
                      placeholder="85.5"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Teacher Comments</label>
                  <Textarea
                    value={teacherComments}
                    onChange={(e) => setTeacherComments(e.target.value)}
                    placeholder="Enter teacher comments..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Principal Comments</label>
                  <Textarea
                    value={principalComments}
                    onChange={(e) => setPrincipalComments(e.target.value)}
                    placeholder="Enter principal comments..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleGenerateReportCard} className="w-full">
                  Generate Report Card
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>{card.student_name}</TableCell>
                <TableCell>{card.class_name}</TableCell>
                <TableCell>{card.academic_year}</TableCell>
                <TableCell>{card.term}</TableCell>
                <TableCell>{card.overall_grade || '-'}</TableCell>
                <TableCell>{card.overall_percentage ? `${card.overall_percentage}%` : '-'}</TableCell>
                <TableCell>{new Date(card.generated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
