import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const { user, userRole, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">NRI High School Portal</h1>
          <Button variant="ghost" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome Back!
              </CardTitle>
              <CardDescription>
                You are logged in as: <strong className="capitalize">{userRole || 'Loading...'}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">User ID:</span> {user?.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Under Construction</CardTitle>
              <CardDescription>
                Phase 1 authentication is complete. Next phases will add:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Student dashboard with attendance and grades</li>
                <li>Teacher dashboard for managing classes</li>
                <li>Admin dashboard for user management</li>
                <li>Course and class management</li>
                <li>File uploads and resources</li>
                <li>Notifications and announcements</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
