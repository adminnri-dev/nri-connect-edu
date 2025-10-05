import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, Download } from 'lucide-react';

interface ChildReportCardsProps {
  studentId: string;
}

export function ChildReportCards({ studentId }: ChildReportCardsProps) {
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchReportCards();
    }
  }, [studentId]);

  const fetchReportCards = async () => {
    try {
      const { data, error } = await supabase
        .from('report_cards')
        .select(`
          *,
          classes(name, section)
        `)
        .eq('student_id', studentId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReportCards(data || []);
    } catch (error: any) {
      console.error('Error fetching report cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-green-600',
      'A': 'text-green-600',
      'B': 'text-blue-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
    };
    return colors[grade] || 'text-gray-600';
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center">Loading report cards...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Cards</CardTitle>
        <CardDescription>Academic performance reports</CardDescription>
      </CardHeader>
      <CardContent>
        {reportCards.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No report cards available yet</p>
        ) : (
          <div className="space-y-4">
            {reportCards.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {report.term} - {report.academic_year}
                      </CardTitle>
                      <CardDescription>
                        {report.classes.name} - {report.classes.section}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      {report.overall_grade && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Overall Grade</p>
                          <p className={`text-3xl font-bold ${getGradeColor(report.overall_grade)}`}>
                            {report.overall_grade}
                          </p>
                        </div>
                      )}
                      {report.overall_percentage && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Percentage</p>
                          <p className="text-2xl font-bold">
                            {report.overall_percentage}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.teacher_comments && (
                    <div>
                      <h4 className="font-semibold mb-2">Teacher Comments:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {report.teacher_comments}
                      </p>
                    </div>
                  )}
                  
                  {report.principal_comments && (
                    <div>
                      <h4 className="font-semibold mb-2">Principal Comments:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {report.principal_comments}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Generated on {format(new Date(report.generated_at), 'dd MMM yyyy')}
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}