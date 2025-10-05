import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

interface StudentFeeManagementProps {
  onUpdate: () => void;
}

export function StudentFeeManagement({ onUpdate }: StudentFeeManagementProps) {
  const { toast } = useToast();
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentFees();
  }, []);

  const fetchStudentFees = async () => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          *,
          profiles!student_fees_student_id_fkey(full_name, email),
          fee_structures(fee_type, class, section, academic_year)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setStudentFees(data || []);
    } catch (error: any) {
      console.error('Error fetching student fees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student fees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const filteredFees = studentFees.filter(fee => 
    fee.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.fee_structures?.fee_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Fees Overview</CardTitle>
        <CardDescription>View and manage student fee assignments</CardDescription>
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, email, or fee type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{fee.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{fee.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{fee.fee_structures?.fee_type}</TableCell>
                <TableCell>{fee.fee_structures?.class} - {fee.fee_structures?.section}</TableCell>
                <TableCell>₹{fee.amount_due.toFixed(2)}</TableCell>
                <TableCell>₹{fee.amount_paid.toFixed(2)}</TableCell>
                <TableCell className="font-semibold">₹{(fee.amount_due - fee.amount_paid).toFixed(2)}</TableCell>
                <TableCell>{format(new Date(fee.due_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{getStatusBadge(fee.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}