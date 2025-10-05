import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface FeeStructureManagementProps {
  onUpdate: () => void;
}

export function FeeStructureManagement({ onUpdate }: FeeStructureManagementProps) {
  const { toast } = useToast();
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    class: '',
    section: '',
    academicYear: '',
    feeType: '',
    amount: '',
    frequency: 'monthly',
    dueDate: '',
    description: ''
  });

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeeStructures(data || []);
    } catch (error: any) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        class: formData.class,
        section: formData.section,
        academic_year: formData.academicYear,
        fee_type: formData.feeType,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        due_date: formData.dueDate,
        description: formData.description || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('fee_structures')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Success', description: 'Fee structure updated successfully' });
      } else {
        const { error } = await supabase
          .from('fee_structures')
          .insert(payload);

        if (error) throw error;
        toast({ title: 'Success', description: 'Fee structure created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      await fetchFeeStructures();
      onUpdate();
    } catch (error: any) {
      console.error('Error saving fee structure:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save fee structure',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (structure: any) => {
    setEditingId(structure.id);
    setFormData({
      class: structure.class,
      section: structure.section,
      academicYear: structure.academic_year,
      feeType: structure.fee_type,
      amount: structure.amount.toString(),
      frequency: structure.frequency,
      dueDate: structure.due_date,
      description: structure.description || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;

    try {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Success', description: 'Fee structure deleted successfully' });
      await fetchFeeStructures();
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting fee structure:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete fee structure',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      class: '',
      section: '',
      academicYear: '',
      feeType: '',
      amount: '',
      frequency: 'monthly',
      dueDate: '',
      description: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Structures</CardTitle>
            <CardDescription>Manage fee structures for different classes</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Fee Structure</DialogTitle>
                <DialogDescription>Define fee structure for a class</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    placeholder="2024-2025"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feeType">Fee Type</Label>
                    <Select value={formData.feeType} onValueChange={(value) => setFormData({ ...formData, feeType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tuition">Tuition</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="lab">Laboratory</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="exam">Examination</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="one-time">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {editingId ? 'Update' : 'Create'} Fee Structure
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeStructures.map((structure) => (
              <TableRow key={structure.id}>
                <TableCell>{structure.class} - {structure.section}</TableCell>
                <TableCell className="capitalize">{structure.fee_type}</TableCell>
                <TableCell>₹{structure.amount.toFixed(2)}</TableCell>
                <TableCell className="capitalize">{structure.frequency}</TableCell>
                <TableCell>{format(new Date(structure.due_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(structure)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(structure.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}