import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

export function FeeReports() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [filterMonth]);

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from('fee_payments')
        .select(`
          *,
          profiles!fee_payments_student_id_fkey(full_name, email),
          student_fees(
            fee_structures(fee_type, class, section)
          )
        `)
        .order('payment_date', { ascending: false });

      if (filterMonth !== 'all') {
        const year = new Date().getFullYear();
        const month = parseInt(filterMonth);
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        query = query.gte('payment_date', startDate).lte('payment_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const exportToCSV = () => {
    const headers = ['Date', 'Receipt No', 'Student', 'Fee Type', 'Amount', 'Payment Method', 'Reference'];
    const rows = payments.map(p => [
      format(new Date(p.payment_date), 'dd/MM/yyyy'),
      p.receipt_number,
      p.profiles?.full_name || '',
      p.student_fees?.fee_structures?.fee_type || '',
      p.amount,
      p.payment_method,
      p.payment_reference || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Reports</CardTitle>
              <CardDescription>View payment history and generate reports</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="0">January</SelectItem>
                  <SelectItem value="1">February</SelectItem>
                  <SelectItem value="2">March</SelectItem>
                  <SelectItem value="3">April</SelectItem>
                  <SelectItem value="4">May</SelectItem>
                  <SelectItem value="5">June</SelectItem>
                  <SelectItem value="6">July</SelectItem>
                  <SelectItem value="7">August</SelectItem>
                  <SelectItem value="8">September</SelectItem>
                  <SelectItem value="9">October</SelectItem>
                  <SelectItem value="10">November</SelectItem>
                  <SelectItem value="11">December</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-2xl font-bold">Total Collected: ₹{totalCollected.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{payments.length} transactions</p>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receipt No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.payment_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{payment.receipt_number}</TableCell>
                  <TableCell>{payment.profiles?.full_name}</TableCell>
                  <TableCell className="capitalize">{payment.student_fees?.fee_structures?.fee_type}</TableCell>
                  <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                  <TableCell className="uppercase">{payment.payment_method}</TableCell>
                  <TableCell>{payment.payment_reference || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}