import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ChildFeesProps {
  studentId: string;
}

export function ChildFees({ studentId }: ChildFeesProps) {
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDue: 0,
    totalPaid: 0,
    pending: 0,
    overdue: 0
  });

  useEffect(() => {
    if (studentId) {
      fetchFees();
      fetchPayments();
    }
  }, [studentId]);

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          *,
          fee_structures(fee_type, description, class, section)
        `)
        .eq('student_id', studentId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setFees(data || []);

      // Calculate stats
      if (data && data.length > 0) {
        const totalDue = data.reduce((sum, fee) => sum + fee.amount_due, 0);
        const totalPaid = data.reduce((sum, fee) => sum + fee.amount_paid, 0);
        const pending = totalDue - totalPaid;
        const overdue = data.filter(fee => fee.status === 'overdue').length;

        setStats({ totalDue, totalPaid, pending, overdue });
      }
    } catch (error: any) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          *,
          student_fees(
            fee_structures(fee_type)
          )
        `)
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      partial: 'secondary',
      pending: 'outline',
      overdue: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center">Loading fees...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalDue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{stats.pending.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
          <CardDescription>All fee assignments and balances</CardDescription>
        </CardHeader>
        <CardContent>
          {fees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No fees assigned yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="capitalize font-medium">
                      {fee.fee_structures.fee_type}
                    </TableCell>
                    <TableCell>{fee.fee_structures.class} - {fee.fee_structures.section}</TableCell>
                    <TableCell>₹{fee.amount_due.toFixed(2)}</TableCell>
                    <TableCell>₹{fee.amount_paid.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">₹{(fee.amount_due - fee.amount_paid).toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(fee.due_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Last 10 payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payments made yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt No</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.payment_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-mono text-sm">{payment.receipt_number}</TableCell>
                    <TableCell className="capitalize">
                      {payment.student_fees?.fee_structures?.fee_type}
                    </TableCell>
                    <TableCell className="font-semibold">₹{payment.amount.toFixed(2)}</TableCell>
                    <TableCell className="uppercase text-sm">{payment.payment_method}</TableCell>
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