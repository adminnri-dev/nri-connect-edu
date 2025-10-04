import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
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

export default function AttendanceManagement() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [classesRes, attendanceRes] = await Promise.all([
        supabase.from('classes').select('id, name, section'),
        supabase.from('attendance').select('*').order('date', { ascending: false }).limit(50)
      ]);

      if (classesRes.error) throw classesRes.error;
      if (attendanceRes.error) throw attendanceRes.error;

      setClasses(classesRes.data || []);
      
      const studentIds = [...new Set(attendanceRes.data?.map(r => r.student_id))];
      const classIds = [...new Set(attendanceRes.data?.map(r => r.class_id))];

      const [studentsRes, classDetailsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name').in('user_id', studentIds),
        supabase.from('classes').select('id, name, section').in('id', classIds)
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (classDetailsRes.error) throw classDetailsRes.error;

      const studentMap = new Map(studentsRes.data?.map(s => [s.user_id, s.full_name]));
      const classMap = new Map(classDetailsRes.data?.map(c => [c.id, `${c.name} - ${c.section}`]));

      const attendanceWithNames = attendanceRes.data?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        class_id: record.class_id,
        date: record.date,
        status: record.status as 'present' | 'absent' | 'late',
        notes: record.notes,
        student_name: studentMap.get(record.student_id) || 'Unknown',
        class_name: classMap.get(record.class_id) || 'Unknown'
      })) || [];

      setAttendance(attendanceWithNames);
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

  const handleMarkAttendance = async (e: React.FormEvent) => {
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
      
      const { error } = await supabase.from('attendance').insert({
        student_id: selectedStudent,
        class_id: selectedClass,
        date: selectedDate,
        status,
        notes: notes || null,
        marked_by: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });

      setDialogOpen(false);
      setSelectedStudent('');
      setStatus('present');
      setNotes('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark attendance',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attendance Management</CardTitle>
            <CardDescription>Track and manage student attendance</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Calendar className="h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>Record student attendance for a class</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMarkAttendance} className="space-y-4">
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
                  <Label htmlFor="date">Date</Label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                  />
                </div>
                <Button type="submit" className="w-full">Mark Attendance</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading attendance records...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.student_name}</TableCell>
                  <TableCell>{record.class_name}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className="capitalize">{record.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.notes || '-'}</TableCell>
                </TableRow>
              ))}
              {attendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No attendance records found
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
