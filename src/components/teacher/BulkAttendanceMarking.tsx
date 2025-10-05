import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export function BulkAttendanceMarking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; notes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [markAllAs, setMarkAllAs] = useState('present');

  useEffect(() => {
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: enrollments, error: enrollError } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .eq('class_id', selectedClass)
        .eq('status', 'active');

      if (enrollError) throw enrollError;

      if (enrollments && enrollments.length > 0) {
        const studentIds = enrollments.map(e => e.student_id);
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', studentIds);

        if (profileError) throw profileError;

        const studentsList = profiles?.map(profile => ({
          id: profile.user_id,
          name: profile.full_name,
          email: profile.email
        })) || [];

        setStudents(studentsList);

        // Initialize attendance state
        const initialAttendance: Record<string, { status: string; notes: string }> = {};
        studentsList.forEach(student => {
          initialAttendance[student.id] = { status: 'present', notes: '' };
        });
        setAttendance(initialAttendance);
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, status, notes')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      if (error) throw error;

      if (data && data.length > 0) {
        const existingAttendance: Record<string, { status: string; notes: string }> = {};
        data.forEach(record => {
          existingAttendance[record.student_id] = {
            status: record.status,
            notes: record.notes || ''
          };
        });
        setAttendance(prev => ({ ...prev, ...existingAttendance }));

        toast({
          title: 'Info',
          description: 'Attendance already marked for this date. You can update it.',
        });
      }
    } catch (error: any) {
      console.error('Error fetching existing attendance:', error);
    }
  };

  const handleMarkAll = () => {
    const updatedAttendance: Record<string, { status: string; notes: string }> = {};
    students.forEach(student => {
      updatedAttendance[student.id] = {
        status: markAllAs,
        notes: attendance[student.id]?.notes || ''
      };
    });
    setAttendance(updatedAttendance);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a class with students',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Delete existing attendance for this date
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      // Insert new attendance records
      const records = students.map(student => ({
        class_id: selectedClass,
        student_id: student.id,
        date: selectedDate,
        status: attendance[student.id]?.status || 'present',
        notes: attendance[student.id]?.notes || null,
        marked_by: user?.id
      }));

      const { error } = await supabase
        .from('attendance')
        .insert(records);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Attendance marked for ${students.length} students`,
      });
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const stats = {
    present: Object.values(attendance).filter(a => a.status === 'present').length,
    absent: Object.values(attendance).filter(a => a.status === 'absent').length,
    late: Object.values(attendance).filter(a => a.status === 'late').length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Attendance Marking</CardTitle>
          <CardDescription>Mark attendance for entire class at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mark All As</Label>
              <div className="flex gap-2">
                <Select value={markAllAs} onValueChange={setMarkAllAs}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleMarkAll} variant="outline">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {['present', 'absent', 'late'].map(status => (
                            <Button
                              key={status}
                              variant={attendance[student.id]?.status === status ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student.id, status)}
                              className="capitalize"
                            >
                              {getStatusIcon(status)}
                              <span className="ml-1">{status}</span>
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Optional notes"
                          value={attendance[student.id]?.notes || ''}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          className="max-w-xs"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit} disabled={loading} size="lg">
                  {loading ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedClass && students.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No students enrolled in this class
          </CardContent>
        </Card>
      )}
    </div>
  );
}