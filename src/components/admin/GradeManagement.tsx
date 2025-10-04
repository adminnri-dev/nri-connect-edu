import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Trash2 } from 'lucide-react';

interface Grade {
  id: string;
  student_id: string;
  class_id: string;
  assignment_name: string;
  assignment_type: string;
  score: number;
  max_score: number;
  date: string;
  notes: string | null;
  student_name: string;
  class_name: string;
}

interface ClassData {
  id: string;
  name: string;
  section: string;
}

interface StudentData {
  user_id: string;
  full_name: string;
}

export default function GradeManagement() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentType, setAssignmentType] = useState('homework');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [classesRes, gradesRes] = await Promise.all([
        supabase.from('classes').select('id, name, section'),
        supabase.from('grades').select('*').order('date', { ascending: false }).limit(50)
      ]);

      if (classesRes.error) throw classesRes.error;
      if (gradesRes.error) throw gradesRes.error;

      setClasses(classesRes.data || []);

      const studentIds = [...new Set(gradesRes.data?.map(r => r.student_id))];
      const classIds = [...new Set(gradesRes.data?.map(r => r.class_id))];

      const [studentsRes, classDetailsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name').in('user_id', studentIds),
        supabase.from('classes').select('id, name, section').in('id', classIds)
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (classDetailsRes.error) throw classDetailsRes.error;

      const studentMap = new Map(studentsRes.data?.map(s => [s.user_id, s.full_name]));
      const classMap = new Map(classDetailsRes.data?.map(c => [c.id, `${c.name} - ${c.section}`]));

      const gradesWithNames = gradesRes.data?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        class_id: record.class_id,
        assignment_name: record.assignment_name,
        assignment_type: record.assignment_type,
        score: record.score,
        max_score: record.max_score,
        date: record.date,
        notes: record.notes,
        student_name: studentMap.get(record.student_id) || 'Unknown',
        class_name: classMap.get(record.class_id) || 'Unknown'
      })) || [];

      setGrades(gradesWithNames);
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

  const fetchStudents = async (classId: string) => {
    try {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (rolesError) throw rolesError;

      const studentIds = userRoles?.map(r => r.user_id) || [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', studentIds);

      if (profilesError) throw profilesError;

      setStudents(profiles || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch students',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass || !selectedStudent) {
      toast({
        title: 'Error',
        description: 'Please select both class and student',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('grades').insert({
        student_id: selectedStudent,
        class_id: selectedClass,
        assignment_name: assignmentName,
        assignment_type: assignmentType,
        score: parseFloat(score),
        max_score: parseFloat(maxScore),
        date,
        notes: notes || null,
        teacher_id: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Grade added successfully',
      });

      setDialogOpen(false);
      setSelectedStudent('');
      setAssignmentName('');
      setAssignmentType('homework');
      setScore('');
      setMaxScore('100');
      setNotes('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add grade',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
      const { error } = await supabase.from('grades').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Grade deleted successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete grade',
        variant: 'destructive',
      });
    }
  };

  const calculatePercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Grade Management</CardTitle>
            <CardDescription>Manage student grades and assignments</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                Add Grade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Grade</DialogTitle>
                <DialogDescription>Record a grade for a student assignment</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
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
                <div className="space-y-2">
                  <Label htmlFor="assignment">Assignment Name</Label>
                  <Input
                    id="assignment"
                    value={assignmentName}
                    onChange={(e) => setAssignmentName(e.target.value)}
                    placeholder="e.g., Math Quiz 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Assignment Type</Label>
                  <Select value={assignmentType} onValueChange={setAssignmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">Homework</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      type="number"
                      step="0.01"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Max Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      step="0.01"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                  />
                </div>
                <Button type="submit" className="w-full">Add Grade</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading grades...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.student_name}</TableCell>
                  <TableCell>{grade.class_name}</TableCell>
                  <TableCell>{grade.assignment_name}</TableCell>
                  <TableCell className="capitalize">{grade.assignment_type}</TableCell>
                  <TableCell>
                    {grade.score}/{grade.max_score} ({calculatePercentage(grade.score, grade.max_score)}%)
                  </TableCell>
                  <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGrade(grade.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {grades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No grades found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
