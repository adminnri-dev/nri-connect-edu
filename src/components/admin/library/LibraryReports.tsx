import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, AlertCircle, TrendingUp } from 'lucide-react';

export function LibraryReports() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get book stats
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('total_copies, available_copies');

      if (booksError) throw booksError;

      const totalBooks = books?.reduce((sum, book) => sum + book.total_copies, 0) || 0;
      const availableBooks = books?.reduce((sum, book) => sum + book.available_copies, 0) || 0;

      // Get borrowing stats
      const { data: borrowings, error: borrowingsError } = await supabase
        .from('book_borrowings')
        .select('status, due_date')
        .eq('status', 'borrowed');

      if (borrowingsError) throw borrowingsError;

      const borrowedBooks = borrowings?.length || 0;
      const today = new Date().toISOString().split('T')[0];
      const overdueBooks = borrowings?.filter(b => b.due_date < today).length || 0;

      setStats({
        totalBooks,
        availableBooks,
        borrowedBooks,
        overdueBooks
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.borrowedBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueBooks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library Statistics</CardTitle>
          <CardDescription>Overview of library usage and inventory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-sm font-medium">Borrowing Rate</span>
            <span className="text-2xl font-bold">
              {stats.totalBooks > 0 ? ((stats.borrowedBooks / stats.totalBooks) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-sm font-medium">Availability Rate</span>
            <span className="text-2xl font-bold text-green-600">
              {stats.totalBooks > 0 ? ((stats.availableBooks / stats.totalBooks) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium">Overdue Rate</span>
            <span className="text-2xl font-bold text-red-600">
              {stats.borrowedBooks > 0 ? ((stats.overdueBooks / stats.borrowedBooks) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}