import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Test user database
const testUsers = [
  {
    id: 'NRI24031',
    firstName: 'Rahul',
    dob: '2009-03-12',
    role: 'student'
  },
  {
    id: 'TCH101',
    firstName: 'Suresh',
    dob: '1985-02-14',
    role: 'teacher'
  },
  {
    id: 'ADM001',
    firstName: 'Anita',
    dob: '1979-09-10',
    role: 'admin'
  }
];

export default function CustomLogin() {
  const [schoolId, setSchoolId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [dob, setDob] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Format the selected date to match our database format
    const formattedDob = dob ? format(dob, 'yyyy-MM-dd') : '';

    // Check if credentials match any user in our test database
    const matchedUser = testUsers.find(
      user =>
        user.id === schoolId &&
        user.firstName.toLowerCase() === firstName.toLowerCase() &&
        user.dob === formattedDob
    );

    if (matchedUser) {
      // Store user info in localStorage
      localStorage.setItem('customUser', JSON.stringify({
        id: matchedUser.id,
        firstName: matchedUser.firstName,
        role: matchedUser.role
      }));

      toast({
        title: 'Login successful',
        description: `Welcome back, ${matchedUser.firstName}!`,
      });

      // Redirect based on role
      setTimeout(() => {
        if (matchedUser.role === 'student') {
          navigate('/student-dashboard');
        } else if (matchedUser.role === 'teacher') {
          navigate('/teacher-dashboard');
        } else if (matchedUser.role === 'admin') {
          navigate('/admin-dashboard');
        }
      }, 500);
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid details. Please check and try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">NRI High School</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID / Admission Number</Label>
              <Input
                id="schoolId"
                type="text"
                placeholder="e.g., NRI24031"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dob && 'text-muted-foreground'
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? format(dob, 'PPP') : <span>Pick your date of birth</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dob}
                    onSelect={setDob}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
