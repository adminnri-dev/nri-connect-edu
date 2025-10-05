import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { z } from 'zod';

// Validation schema for student data
const studentSchema = z.object({
  admission_no: z.string().min(1, "Admission number is required").max(50),
  full_name: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Invalid email").max(255),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  class: z.string().min(1, "Class is required").max(50),
  section: z.string().min(1, "Section is required").max(50),
  parent_name: z.string().min(1, "Parent name is required").max(200),
  parent_contact: z.string().min(10, "Valid phone number required").max(20),
  parent_email: z.string().email("Invalid parent email").max(255).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal(''))
});

type StudentData = z.infer<typeof studentSchema>;

interface ParsedRow extends StudentData {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

export function BulkStudentImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const { toast } = useToast();

  // Generate CSV template
  const downloadTemplate = () => {
    const headers = [
      'admission_no',
      'full_name',
      'email',
      'date_of_birth',
      'class',
      'section',
      'parent_name',
      'parent_contact',
      'parent_email',
      'address'
    ];
    
    const sampleData = [
      [
        'ADM001',
        'John Doe',
        'john.doe@school.edu',
        '2010-05-15',
        '5',
        'A',
        'Mr. Robert Doe',
        '9876543210',
        'robert.doe@email.com',
        '123 Main St, City'
      ],
      [
        'ADM002',
        'Jane Smith',
        'jane.smith@school.edu',
        '2010-08-22',
        '5',
        'B',
        'Mrs. Sarah Smith',
        '9876543211',
        'sarah.smith@email.com',
        '456 Oak Ave, City'
      ]
    ];

    const csv = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: 'Fill in the template and upload it to import students',
    });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFile(uploadedFile);
    parseCSV(uploadedFile);
  };

  // Parse and validate CSV
  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: ParsedRow[] = results.data.map((row: any, index) => {
          const validation = studentSchema.safeParse(row);
          
          return {
            ...row,
            rowNumber: index + 2, // +2 because of header and 0-index
            isValid: validation.success,
            errors: validation.success ? [] : validation.error.errors.map(e => e.message)
          };
        });

        setParsedData(parsed);
        
        const validCount = parsed.filter(r => r.isValid).length;
        const invalidCount = parsed.length - validCount;

        toast({
          title: 'CSV Parsed',
          description: `${validCount} valid rows, ${invalidCount} invalid rows`,
        });
      },
      error: (error) => {
        toast({
          title: 'Parse Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  // Import students to database
  const importStudents = async () => {
    const validRows = parsedData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      toast({
        title: 'No Valid Data',
        description: 'Please fix errors before importing',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const student = validRows[i];
      
      try {
        // First, create user in auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: student.email,
          password: student.date_of_birth.replace(/-/g, ''), // Use DOB as initial password
          email_confirm: true,
          user_metadata: {
            full_name: student.full_name
          }
        });

        if (authError) throw authError;

        // Assign student role
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'student'
        });

        // Create student profile
        await supabase.from('student_profiles').insert({
          user_id: authData.user.id,
          admission_no: student.admission_no,
          date_of_birth: student.date_of_birth,
          class: student.class,
          section: student.section,
          parent_name: student.parent_name,
          parent_contact: student.parent_contact,
          parent_email: student.parent_email || null,
          address: student.address || null
        });

        successCount++;
      } catch (error: any) {
        console.error(`Failed to import row ${student.rowNumber}:`, error);
        failedCount++;
      }

      setProgress(((i + 1) / validRows.length) * 100);
    }

    setImporting(false);
    setImportResults({ success: successCount, failed: failedCount });

    toast({
      title: 'Import Complete',
      description: `${successCount} students imported successfully, ${failedCount} failed`,
    });
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Student Import</CardTitle>
          <CardDescription>
            Import multiple students at once using a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Download Template */}
          <div>
            <h3 className="font-semibold mb-2">Step 1: Download Template</h3>
            <Button onClick={downloadTemplate} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Download the template, fill it with student data, and upload it below
            </p>
          </div>

          {/* Step 2: Upload File */}
          <div>
            <h3 className="font-semibold mb-2">Step 2: Upload Filled CSV</h3>
            <div className="flex items-center gap-4">
              <label htmlFor="csv-upload">
                <Button variant="outline" className="gap-2 cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    {file ? file.name : 'Choose CSV File'}
                  </span>
                </Button>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Validation Summary */}
          {parsedData.length > 0 && (
            <Alert>
              <AlertDescription className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{validCount} valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span>{invalidCount} invalid</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Importing... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <Alert>
              <AlertDescription>
                <div className="font-semibold mb-2">Import Complete</div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {importResults.success} students imported successfully
                  </div>
                  {importResults.failed > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      {importResults.failed} students failed to import
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Button */}
          {parsedData.length > 0 && validCount > 0 && !importResults && (
            <Button 
              onClick={importStudents} 
              disabled={importing}
              className="w-full gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import {validCount} Students
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Data Preview */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>Review and fix errors before importing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Invalid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{row.admission_no}</TableCell>
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.class}-{row.section}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 && (
                          <div className="text-xs text-destructive space-y-1">
                            {row.errors.map((error, i) => (
                              <div key={i} className="flex items-start gap-1">
                                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}