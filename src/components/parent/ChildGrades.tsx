import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChildGradesProps {
  studentId: string;
}

export function ChildGrades({ studentId }: ChildGradesProps) {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
    total: 0
  });

  useEffect(() => {
    if (studentId) {
      fetchGrades();
    }
  }, [studentId]);

  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select(`
          *,
          classes(name, section)
        `)
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) throw error;

      setGrades(data || []);

      // Calculate stats
      if (data && data.length > 0) {
        const percentages = data.map(g => (g.score / g.max_score) * 100);
        const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
        setStats({
          average: avg,
          highest: Math.max(...percentages),
          lowest: Math.min(...percentages),
          total: data.length
        });
      }
    } catch (error: any) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(1);
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center">Loading grades...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highest.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowest.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade History</CardTitle>
          <CardDescription>All recorded grades and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No grades recorded yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => {
                  const percentage = parseFloat(getPercentage(grade.score, grade.max_score));
                  return (
                    <TableRow key={grade.id}>
                      <TableCell>{format(new Date(grade.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{grade.classes.name} - {grade.classes.section}</TableCell>
                      <TableCell className="font-medium">{grade.assignment_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {grade.assignment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{grade.score} / {grade.max_score}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getGradeColor(percentage)}`}>
                          {percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {grade.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}