import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Search, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function LibraryView() {
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchBorrowedBooks();
    }
  }, [user, categoryFilter]);

  const fetchBooks = async () => {
    try {
      let query = supabase
        .from('books')
        .select('*')
        .order('title');

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('book_borrowings')
        .select(`
          *,
          book:books(title, author, isbn)
        `)
        .eq('student_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setBorrowedBooks(data || []);
    } catch (error: any) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBorrowings = borrowedBooks.filter(b => b.status === 'borrowed');
  const borrowingHistory = borrowedBooks.filter(b => b.status === 'returned');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      borrowed: 'secondary',
      returned: 'default',
      overdue: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <Tabs defaultValue="browse" className="space-y-6">
      <TabsList>
        <TabsTrigger value="browse">Browse Books</TabsTrigger>
        <TabsTrigger value="borrowed">My Books ({activeBorrowings.length})</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="browse">
        <Card>
          <CardHeader>
            <CardTitle>Library Catalog</CardTitle>
            <CardDescription>Browse available books</CardDescription>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non_fiction">Non-Fiction</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="literature">Literature</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                  <SelectItem value="magazine">Magazine</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {book.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={book.available_copies > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                        {book.available_copies}/{book.total_copies}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="borrowed">
        <Card>
          <CardHeader>
            <CardTitle>Currently Borrowed Books</CardTitle>
            <CardDescription>Books you need to return</CardDescription>
          </CardHeader>
          <CardContent>
            {activeBorrowings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No books currently borrowed</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBorrowings.map((borrowing) => {
                    const isOverdue = new Date(borrowing.due_date) < new Date();
                    return (
                      <TableRow key={borrowing.id}>
                        <TableCell className="font-medium">{borrowing.book?.title}</TableCell>
                        <TableCell>{borrowing.book?.author}</TableCell>
                        <TableCell>{format(new Date(borrowing.issue_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                          {format(new Date(borrowing.due_date), 'dd/MM/yyyy')}
                          {isOverdue && <Clock className="inline ml-2 h-4 w-4" />}
                        </TableCell>
                        <TableCell>{getStatusBadge(borrowing.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Borrowing History</CardTitle>
            <CardDescription>Previously borrowed books</CardDescription>
          </CardHeader>
          <CardContent>
            {borrowingHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No borrowing history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowingHistory.map((borrowing) => (
                    <TableRow key={borrowing.id}>
                      <TableCell className="font-medium">{borrowing.book?.title}</TableCell>
                      <TableCell>{borrowing.book?.author}</TableCell>
                      <TableCell>{format(new Date(borrowing.issue_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        {borrowing.return_date ? format(new Date(borrowing.return_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(borrowing.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}