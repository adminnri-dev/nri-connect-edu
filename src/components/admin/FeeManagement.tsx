import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, Users, AlertCircle } from 'lucide-react';
import { FeeStructureManagement } from './fee/FeeStructureManagement';
import { StudentFeeManagement } from './fee/StudentFeeManagement';
import { PaymentRecording } from './fee/PaymentRecording';
import { FeeReports } from './fee/FeeReports';

export default function FeeManagement() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalPending: 0,
    totalCollected: 0,
    overdueCount: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total pending and paid amounts
      const { data: fees, error: feesError } = await supabase
        .from('student_fees')
        .select('amount_due, amount_paid, status');

      if (feesError) throw feesError;

      const totalPending = fees?.reduce((sum, fee) => sum + (fee.amount_due - fee.amount_paid), 0) || 0;
      const totalCollected = fees?.reduce((sum, fee) => sum + fee.amount_paid, 0) || 0;
      const overdueCount = fees?.filter(fee => fee.status === 'overdue').length || 0;

      // Get total students with fees
      const { count: studentCount, error: countError } = await supabase
        .from('student_fees')
        .select('student_id', { count: 'exact', head: true });

      if (countError) throw countError;

      setStats({
        totalPending,
        totalCollected,
        overdueCount,
        totalStudents: studentCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fee statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalCollected.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="structures" className="space-y-4">
        <TabsList>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="student-fees">Student Fees</TabsTrigger>
          <TabsTrigger value="payments">Record Payment</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="structures">
          <FeeStructureManagement onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="student-fees">
          <StudentFeeManagement onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentRecording onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="reports">
          <FeeReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}