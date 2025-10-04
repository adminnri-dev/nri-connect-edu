import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrollment_date: string;
  status: string;
  student_name?: string;
  class_name?: string;
}

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select('*')
        .order('enrollment_date', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*');

      if (classesError) throw classesError;
      setClasses(classesData || []);

      // Enrich enrollments with names
      const enrichedEnrollments = (enrollmentsData || []).map(enrollment => ({
        ...enrollment,
        student_name: studentsData?.find(s => s.user_id === enrollment.student_id)?.full_name,
        class_name: classesData?.find(c => c.id === enrollment.class_id)?.name + ' - ' + classesData?.find(c => c.id === enrollment.class_id)?.section,
      }));

      setEnrollments(enrichedEnrollments);
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

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedClass) {
      toast({
        title: 'Error',
        description: 'Please select both student and class',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('student_enrollments')
        .insert({
          student_id: selectedStudent,
          class_id: selectedClass,
          status: selectedStatus,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student enrolled successfully',
      });

      setDialogOpen(false);
      setSelectedStudent('');
      setSelectedClass('');
      setSelectedStatus('active');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;

    try {
      const { error } = await supabase
        .from('student_enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Enrollment removed successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Student Enrollment Management</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enroll Student in Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Student</label>
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
                  <label className="text-sm font-medium">Class</label>
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
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleEnroll} className="w-full">
                  Enroll Student
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
              <TableHead>Enrollment Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.student_name}</TableCell>
                <TableCell>{enrollment.class_name}</TableCell>
                <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                    enrollment.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleUnenroll(enrollment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
