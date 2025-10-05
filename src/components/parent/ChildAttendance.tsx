import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface ChildAttendanceProps {
  studentId: string;
}

export function ChildAttendance({ studentId }: ChildAttendanceProps) {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  });

  useEffect(() => {
    if (studentId) {
      fetchAttendance();
    }
  }, [studentId]);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          classes(name, section)
        `)
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) throw error;

      setAttendance(data || []);

      // Calculate stats
      if (data && data.length > 0) {
        const present = data.filter(a => a.status === 'present').length;
        const absent = data.filter(a => a.status === 'absent').length;
        const late = data.filter(a => a.status === 'late').length;
        const percentage = (present / data.length) * 100;

        setStats({ present, absent, late, percentage });
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'destructive' | 'secondary', icon: any }> = {
      present: { variant: 'default', icon: CheckCircle },
      absent: { variant: 'destructive', icon: XCircle },
      late: { variant: 'secondary', icon: Clock }
    };

    const { variant, icon: Icon } = config[status] || config.present;

    return (
      <Badge variant={variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center">Loading attendance...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentage.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
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
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Complete attendance record</CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
          ) : (
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
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{record.classes.name} - {record.classes.section}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}