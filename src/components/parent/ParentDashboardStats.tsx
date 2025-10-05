import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, BookOpen, DollarSign } from 'lucide-react';

export function ParentDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalChildren: 0,
    averageAttendance: 0,
    averageGrade: 0,
    pendingFees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get linked children
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_user_id')
        .eq('parent_user_id', user?.id);

      const childrenIds = links?.map(l => l.student_user_id) || [];
      
      if (childrenIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get attendance stats
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .in('student_id', childrenIds);

      const totalAttendance = attendance?.length || 0;
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
      const avgAttendance = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      // Get grade stats
      const { data: grades } = await supabase
        .from('grades')
        .select('score, max_score')
        .in('student_id', childrenIds);

      const avgGrade = grades && grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length
        : 0;

      // Get pending fees
      const { data: fees } = await supabase
        .from('student_fees')
        .select('amount_due, amount_paid')
        .in('student_id', childrenIds)
        .neq('status', 'paid');

      const pendingAmount = fees?.reduce((sum, f) => sum + (f.amount_due - f.amount_paid), 0) || 0;

      setStats({
        totalChildren: childrenIds.length,
        averageAttendance: Math.round(avgAttendance),
        averageGrade: Math.round(avgGrade),
        pendingFees: Math.round(pendingAmount)
      });

    } catch (error: any) {
      console.error('Error fetching parent stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Children</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChildren}</div>
          <p className="text-xs text-muted-foreground">Linked students</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
          <p className="text-xs text-muted-foreground">Across all children</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageGrade}%</div>
          <p className="text-xs text-muted-foreground">Overall performance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.pendingFees}</div>
          <p className="text-xs text-muted-foreground">Outstanding balance</p>
        </CardContent>
      </Card>
    </div>
  );
}