import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Users, BookOpen, Calendar, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function SampleDataGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sample Data Setup Guide</h1>
          <p className="text-muted-foreground">Follow these steps to populate your school management system with sample data</p>
        </div>

        <Alert className="mb-6 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Sample classes added!</strong> 5 classes have been created for Grade 8, 9, and 10.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Step 1: Create Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Step 1: Create Sample Users</CardTitle>
              </div>
              <CardDescription>Create students and teachers to populate the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Create Students</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <Link to="/auth/signup" className="text-primary hover:underline">Sign Up page</Link></li>
                  <li>Create accounts for students (e.g., student1@nrischools.in, student2@nrischools.in)</li>
                  <li>Use password: <code className="bg-muted px-2 py-1 rounded">Test@1234</code></li>
                  <li>After creating, sign out and sign back in as admin</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Create Teachers</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Repeat the same process for teachers (e.g., teacher1@nrischools.in)</li>
                  <li>Create 2-3 teacher accounts</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assign Roles</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <Link to="/dashboard" className="text-primary hover:underline">Admin Dashboard</Link> → Users tab</li>
                  <li>Manually update roles in the backend database:
                    <div className="bg-muted p-3 rounded mt-2">
                      <p className="text-xs font-mono">Use the backend SQL editor to run:</p>
                      <code className="text-xs block mt-1">
                        UPDATE user_roles SET role = 'student' WHERE user_id = '[user-id]';<br/>
                        UPDATE user_roles SET role = 'teacher' WHERE user_id = '[user-id]';
                      </code>
                    </div>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Assign Teachers to Classes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>Step 2: Assign Teachers to Classes</CardTitle>
              </div>
              <CardDescription>Link teachers to the sample classes</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Admin Dashboard → Classes tab</li>
                <li>Note: Classes already created (Grade 8A, 8B, 9A, 9B, 10A, 10B)</li>
                <li>You can assign teachers by updating classes in the backend or creating new classes with teacher assignments</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 3: Add Attendance Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Step 3: Add Attendance Records</CardTitle>
              </div>
              <CardDescription>Mark sample attendance for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Log in as a teacher or admin</li>
                <li>Go to Attendance tab</li>
                <li>Click "Mark Attendance"</li>
                <li>Select a class and student</li>
                <li>Mark as Present/Absent/Late</li>
                <li>Add multiple records for different dates</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 4: Add Grades */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Step 4: Add Sample Grades</CardTitle>
              </div>
              <CardDescription>Create assignments and grade students</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Grades tab as teacher/admin</li>
                <li>Click "Add Grade"</li>
                <li>Select class and student</li>
                <li>Enter assignment details (e.g., "Math Quiz 1", "Homework 5")</li>
                <li>Add scores (e.g., 85/100, 92/100)</li>
                <li>Create various assignment types: homework, quiz, test, exam</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 5: Create Announcements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Step 5: Post Announcements</CardTitle>
              </div>
              <CardDescription>Share important updates with the school</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Announcements tab</li>
                <li>Click "New Announcement"</li>
                <li>Enter title and content</li>
                <li>Set priority (Normal, High, Urgent)</li>
                <li>Select target audience (All, Students, Teachers, Admins)</li>
                <li>Publish to make it visible</li>
              </ol>
            </CardContent>
          </Card>

          {/* Testing Different Roles */}
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle>Testing Different Dashboards</CardTitle>
              <CardDescription>Experience all user perspectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Admin View</h3>
                <p className="text-sm text-muted-foreground">
                  Full access to manage users, classes, attendance, grades, and announcements
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Teacher View</h3>
                <p className="text-sm text-muted-foreground">
                  Manage assigned classes, mark attendance, grade students, post announcements
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Student View</h3>
                <p className="text-sm text-muted-foreground">
                  View personal grades, attendance history, and school announcements
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center pt-6">
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="outline">Create Test Users</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
