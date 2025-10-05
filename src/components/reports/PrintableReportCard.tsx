import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

interface PrintableReportCardProps {
  reportCard: any;
  student: any;
  grades: any[];
  attendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export function PrintableReportCard({ reportCard, student, grades, attendance }: PrintableReportCardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open('', '', 'width=800,height=1000');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Report Card - ${student.full_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 40px; 
              background: white;
            }
            .report-card {
              max-width: 800px;
              margin: 0 auto;
              border: 3px double #000;
              padding: 30px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .school-name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              margin-top: 10px;
            }
            .student-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
              padding: 15px;
              background: #f9f9f9;
              border: 1px solid #ddd;
            }
            .info-row {
              display: flex;
              margin: 5px 0;
            }
            .label {
              font-weight: bold;
              width: 140px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 10px;
              text-align: left;
            }
            th {
              background: #f0f0f0;
              font-weight: bold;
            }
            .summary {
              margin-top: 30px;
              padding: 20px;
              border: 2px solid #000;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .comments {
              margin-top: 20px;
              padding: 15px;
              border: 1px solid #000;
              min-height: 100px;
            }
            .signature-section {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 30px;
              margin-top: 50px;
            }
            .signature-box {
              text-align: center;
              padding-top: 40px;
              border-top: 1px solid #000;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const attendancePercentage = attendance.total > 0 
    ? ((attendance.present / attendance.total) * 100).toFixed(1)
    : '0';

  return (
    <div>
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Report Card
        </Button>
      </div>

      <div ref={printRef} className="report-card bg-white p-8 border-2 border-border">
        <div className="header">
          <div className="school-name">NRI HIGH SCHOOL</div>
          <div className="text-sm">Excellence in Education</div>
          <div className="report-title">ACADEMIC REPORT CARD</div>
        </div>

        <div className="student-info">
          <div className="info-row">
            <span className="label">Student Name:</span>
            <span>{student.full_name}</span>
          </div>
          <div className="info-row">
            <span className="label">Class:</span>
            <span>{reportCard.classes?.name} - {reportCard.classes?.section}</span>
          </div>
          <div className="info-row">
            <span className="label">Academic Year:</span>
            <span>{reportCard.academic_year}</span>
          </div>
          <div className="info-row">
            <span className="label">Term:</span>
            <span>{reportCard.term}</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3">Academic Performance</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Assignment Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade, idx) => {
                const percentage = (grade.score / grade.max_score) * 100;
                return (
                  <TableRow key={idx}>
                    <TableCell>{grade.assignment_name}</TableCell>
                    <TableCell className="capitalize">{grade.assignment_type}</TableCell>
                    <TableCell>{grade.score}/{grade.max_score}</TableCell>
                    <TableCell>{percentage.toFixed(1)}%</TableCell>
                    <TableCell className="font-bold">{calculateGrade(percentage)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="summary">
          <h3 className="font-bold text-lg mb-3">Summary</h3>
          <div className="summary-grid">
            <div className="info-row">
              <span className="label">Overall Grade:</span>
              <span className="font-bold text-xl">{reportCard.overall_grade || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Overall Percentage:</span>
              <span className="font-bold text-xl">{reportCard.overall_percentage || 'N/A'}%</span>
            </div>
            <div className="info-row">
              <span className="label">Attendance:</span>
              <span className="font-bold">{attendance.present}/{attendance.total} ({attendancePercentage}%)</span>
            </div>
            <div className="info-row">
              <span className="label">Days Absent:</span>
              <span>{attendance.absent}</span>
            </div>
          </div>
        </div>

        {reportCard.teacher_comments && (
          <div className="comments">
            <h4 className="font-bold mb-2">Class Teacher Remarks:</h4>
            <p className="text-sm">{reportCard.teacher_comments}</p>
          </div>
        )}

        {reportCard.principal_comments && (
          <div className="comments">
            <h4 className="font-bold mb-2">Principal's Comments:</h4>
            <p className="text-sm">{reportCard.principal_comments}</p>
          </div>
        )}

        <div className="signature-section">
          <div className="signature-box">
            <div className="font-semibold">Class Teacher</div>
          </div>
          <div className="signature-box">
            <div className="font-semibold">Principal</div>
          </div>
          <div className="signature-box">
            <div className="font-semibold">Parent/Guardian</div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-8">
          Generated on: {format(new Date(reportCard.generated_at), 'dd MMMM yyyy')}
        </div>
      </div>
    </div>
  );
}