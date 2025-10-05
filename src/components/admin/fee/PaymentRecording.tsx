import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Printer, Search } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentRecordingProps {
  onUpdate: () => void;
}

export function PaymentRecording({ onUpdate }: PaymentRecordingProps) {
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  const [formData, setFormData] = useState({
    selectedFeeId: '',
    amount: '',
    paymentMethod: 'cash',
    paymentReference: '',
    notes: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'student')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPendingFees = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          *,
          fee_structures(fee_type, description)
        `)
        .eq('student_id', studentId)
        .neq('status', 'paid')
        .order('due_date');

      if (error) throw error;
      setPendingFees(data || []);
    } catch (error: any) {
      console.error('Error fetching fees:', error);
    }
  };

  const handleStudentSelect = async (studentId: string) => {
    const student = students.find(s => s.user_id === studentId);
    setSelectedStudent(student);
    if (student) {
      await fetchPendingFees(student.user_id);
    }
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP${year}${month}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !formData.selectedFeeId || !formData.amount) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const receiptNumber = generateReceiptNumber();
      const amount = parseFloat(formData.amount);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Record payment
      const { data: payment, error: paymentError } = await supabase
        .from('fee_payments')
        .insert({
          student_fee_id: formData.selectedFeeId,
          student_id: selectedStudent.user_id,
          amount,
          payment_method: formData.paymentMethod,
          payment_reference: formData.paymentReference || null,
          receipt_number: receiptNumber,
          payment_date: new Date().toISOString().split('T')[0],
          received_by: user.id,
          notes: formData.notes || null
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update student fee
      const selectedFee = pendingFees.find(f => f.id === formData.selectedFeeId);
      const newAmountPaid = selectedFee.amount_paid + amount;
      const newStatus = newAmountPaid >= selectedFee.amount_due ? 'paid' : 'partial';

      const { error: updateError } = await supabase
        .from('student_fees')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus
        })
        .eq('id', formData.selectedFeeId);

      if (updateError) throw updateError;

      // Set last receipt for printing
      setLastReceipt({
        ...payment,
        student: selectedStudent,
        fee: selectedFee
      });

      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });

      // Reset form
      setFormData({
        selectedFeeId: '',
        amount: '',
        paymentMethod: 'cash',
        paymentReference: '',
        notes: ''
      });
      
      await fetchPendingFees(selectedStudent.user_id);
      onUpdate();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #000; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
          <CardDescription>Record cash or UPI payments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select onValueChange={handleStudentSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.full_name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && pendingFees.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fee">Select Fee</Label>
                  <Select value={formData.selectedFeeId} onValueChange={(value) => {
                    setFormData({ ...formData, selectedFeeId: value });
                    const fee = pendingFees.find(f => f.id === value);
                    if (fee) {
                      setFormData(prev => ({ ...prev, amount: (fee.amount_due - fee.amount_paid).toString() }));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose fee" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingFees.map(fee => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.fee_structures.fee_type} - ₹{(fee.amount_due - fee.amount_paid).toFixed(2)} pending
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod !== 'cash' && (
                  <div className="space-y-2">
                    <Label htmlFor="reference">Payment Reference</Label>
                    <Input
                      id="reference"
                      placeholder="UPI ID, Transaction ID, Cheque No., etc."
                      value={formData.paymentReference}
                      onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </>
            )}

            {selectedStudent && pendingFees.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No pending fees for this student</p>
            )}
          </form>
        </CardContent>
      </Card>

      {lastReceipt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Receipt</CardTitle>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={receiptRef} className="receipt space-y-4 p-6 border-2 border-border rounded-lg">
              <div className="header text-center border-b-2 border-border pb-4 mb-4">
                <h2 className="text-2xl font-bold">NRI HIGH SCHOOL</h2>
                <p className="text-sm text-muted-foreground">Payment Receipt</p>
              </div>

              <div className="row flex justify-between">
                <span className="label font-semibold">Receipt No:</span>
                <span>{lastReceipt.receipt_number}</span>
              </div>

              <div className="row flex justify-between">
                <span className="label font-semibold">Date:</span>
                <span>{format(new Date(lastReceipt.payment_date), 'dd/MM/yyyy')}</span>
              </div>

              <div className="row flex justify-between">
                <span className="label font-semibold">Student Name:</span>
                <span>{lastReceipt.student.full_name}</span>
              </div>

              <div className="row flex justify-between">
                <span className="label font-semibold">Fee Type:</span>
                <span>{lastReceipt.fee.fee_structures.fee_type}</span>
              </div>

              <div className="row flex justify-between">
                <span className="label font-semibold">Amount Paid:</span>
                <span className="text-lg font-bold">₹{lastReceipt.amount.toFixed(2)}</span>
              </div>

              <div className="row flex justify-between">
                <span className="label font-semibold">Payment Method:</span>
                <span className="uppercase">{lastReceipt.payment_method}</span>
              </div>

              {lastReceipt.payment_reference && (
                <div className="row flex justify-between">
                  <span className="label font-semibold">Reference:</span>
                  <span>{lastReceipt.payment_reference}</span>
                </div>
              )}

              {lastReceipt.notes && (
                <div className="row flex justify-between">
                  <span className="label font-semibold">Notes:</span>
                  <span>{lastReceipt.notes}</span>
                </div>
              )}

              <div className="footer text-center mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Thank you for your payment</p>
                <p className="text-xs text-muted-foreground mt-2">This is a computer-generated receipt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}