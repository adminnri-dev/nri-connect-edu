import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';

const studentSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  parentName: z.string().min(1, "Parent name is required"),
  parentContact: z.string().min(10, "Valid contact number is required"),
  parentEmail: z.string().email("Valid email is required").optional().or(z.literal('')),
  address: z.string().optional()
});

export default function StudentProfileManagement() {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [section, setSection] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['student-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: studentUsers } = useQuery({
    queryKey: ['student-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      const studentUserIds = new Set(userRoles?.map(r => r.user_id) || []);
      return profiles?.filter(p => studentUserIds.has(p.user_id)) || [];
    }
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof studentSchema> & { userId: string }) => {
      studentSchema.parse(data);

      const { error } = await supabase
        .from('student_profiles')
        .insert({
          user_id: data.userId,
          admission_no: data.admissionNo,
          class: data.class,
          section: data.section,
          date_of_birth: data.dateOfBirth,
          parent_name: data.parentName,
          parent_contact: data.parentContact,
          parent_email: data.parentEmail || null,
          address: data.address || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Student profile created successfully" });
      queryClient.invalidateQueries({ queryKey: ['student-profiles'] });
      resetForm();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof studentSchema> & { id: string }) => {
      studentSchema.parse(data);

      const { error } = await supabase
        .from('student_profiles')
        .update({
          admission_no: data.admissionNo,
          class: data.class,
          section: data.section,
          date_of_birth: data.dateOfBirth,
          parent_name: data.parentName,
          parent_contact: data.parentContact,
          parent_email: data.parentEmail || null,
          address: data.address || null
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Student profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['student-profiles'] });
      resetForm();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('student_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Student profile deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['student-profiles'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setSelectedStudent(null);
    setUserId('');
    setAdmissionNo('');
    setStudentClass('');
    setSection('');
    setDateOfBirth('');
    setParentName('');
    setParentContact('');
    setParentEmail('');
    setAddress('');
  };

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setAdmissionNo(student.admission_no);
    setStudentClass(student.class);
    setSection(student.section);
    setDateOfBirth(student.date_of_birth);
    setParentName(student.parent_name);
    setParentContact(student.parent_contact);
    setParentEmail(student.parent_email || '');
    setAddress(student.address || '');
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudent) {
      updateStudentMutation.mutate({
        id: selectedStudent.id,
        admissionNo,
        class: studentClass,
        section,
        dateOfBirth,
        parentName,
        parentContact,
        parentEmail,
        address
      });
    } else {
      if (!userId) {
        toast({ title: "Error", description: "Please select a student user", variant: "destructive" });
        return;
      }
      createStudentMutation.mutate({
        userId,
        admissionNo,
        class: studentClass,
        section,
        dateOfBirth,
        parentName,
        parentContact,
        parentEmail,
        address
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Student Profiles</CardTitle>
              <CardDescription>Manage student information and details</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedStudent ? 'Edit' : 'Create'} Student Profile</DialogTitle>
                  <DialogDescription>
                    {selectedStudent ? 'Update' : 'Add'} student information and parent details
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!selectedStudent && (
                    <div className="space-y-2">
                      <Label htmlFor="userId">Student User *</Label>
                      <select
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select a student user</option>
                        {studentUsers?.map((user) => (
                          <option key={user.user_id} value={user.user_id}>
                            {user.full_name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admissionNo">Admission No *</Label>
                      <Input
                        id="admissionNo"
                        value={admissionNo}
                        onChange={(e) => setAdmissionNo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Input
                        id="class"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        placeholder="e.g., 10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section *</Label>
                      <Input
                        id="section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        placeholder="e.g., A"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name *</Label>
                    <Input
                      id="parentName"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentContact">Parent Contact *</Label>
                      <Input
                        id="parentContact"
                        type="tel"
                        value={parentContact}
                        onChange={(e) => setParentContact(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail">Parent Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                    {selectedStudent ? 'Update' : 'Create'} Profile
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.profiles.full_name}</TableCell>
                    <TableCell>{student.admission_no}</TableCell>
                    <TableCell>{student.class}-{student.section}</TableCell>
                    <TableCell>{student.parent_name}</TableCell>
                    <TableCell>{student.parent_contact}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteStudentMutation.mutate(student.id)}
                          disabled={deleteStudentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
