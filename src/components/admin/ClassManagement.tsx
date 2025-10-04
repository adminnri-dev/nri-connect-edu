import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function ClassManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>Manage classes, sections, and assignments</CardDescription>
          </div>
          <Button className="gap-2">
            <BookOpen className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Class management coming in Phase 3</p>
          <p className="text-sm mt-2">This will include creating classes, assigning teachers, and managing sections</p>
        </div>
      </CardContent>
    </Card>
  );
}
