import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function BorrowingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    bookId: '',
    studentId: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchBorrowings();
    fetchBooks();
    fetchStudents();
  }, [filterStatus]);

  const fetchBorrowings = async () => {
    try {
      let query = supabase
        .from('book_borrowings')
        .select(`
          *,
          book:books(title, author),
          student:profiles!book_borrowings_student_id_fkey(full_name, email)
        `)
        .order('issue_date', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBorrowings(data || []);
    } catch (error: any) {
      console.error('Error fetching borrowings:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, available_copies')
        .gt('available_copies', 0)
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error('Error fetching books:', error);
    }
  };

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

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('book_borrowings')
        .insert([{
          book_id: formData.bookId,
          student_id: formData.studentId,
          issued_by: user.id,
          due_date: formData.dueDate,
          notes: formData.notes || null,
          status: 'borrowed'
        }]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Book issued successfully' });
      setDialogOpen(false);
      resetForm();
      await fetchBorrowings();
      await fetchBooks();
    } catch (error: any) {
      console.error('Error issuing book:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to issue book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    if (!user || !confirm('Mark this book as returned?')) return;

    try {
      const { error } = await supabase
        .from('book_borrowings')
        .update({
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0],
          returned_to: user.id
        })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Book returned successfully' });
      await fetchBorrowings();
      await fetchBooks();
    } catch (error: any) {
      console.error('Error returning book:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark as returned',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      bookId: '',
      studentId: '',
      dueDate: '',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      borrowed: 'secondary',
      returned: 'default',
      overdue: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Book Borrowings</CardTitle>
              <CardDescription>Issue and track book borrowings</CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Issue Book
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Issue Book</DialogTitle>
                    <DialogDescription>Issue a book to a student</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleIssue} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student">Student *</Label>
                      <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
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

                    <div className="space-y-2">
                      <Label htmlFor="book">Book *</Label>
                      <Select value={formData.bookId} onValueChange={(value) => setFormData({ ...formData, bookId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map(book => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.title} by {book.author} ({book.available_copies} available)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      Issue Book
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowings.map((borrowing) => (
                <TableRow key={borrowing.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{borrowing.student?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{borrowing.student?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{borrowing.book?.title}</p>
                      <p className="text-sm text-muted-foreground">{borrowing.book?.author}</p>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(borrowing.issue_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(borrowing.due_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {borrowing.return_date ? format(new Date(borrowing.return_date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(borrowing.status)}</TableCell>
                  <TableCell>
                    {borrowing.status === 'borrowed' && (
                      <Button variant="outline" size="sm" onClick={() => handleReturn(borrowing.id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}