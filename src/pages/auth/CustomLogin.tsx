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
import { supabase } from '@/integrations/supabase/client';

export default function CustomLogin() {
  const [schoolId, setSchoolId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [dob, setDob] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!schoolId || !firstName || !dob) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        return;
      }

      const formattedDob = format(dob, 'yyyy-MM-dd');

      // Check rate limit first
      const { data: canAttempt, error: rateLimitError } = await supabase.rpc('check_login_rate_limit', {
        _identifier: schoolId
      });

      if (canAttempt === false) {
        toast({
          title: 'Too many attempts',
          description: 'Please wait 15 minutes before trying again.',
          variant: 'destructive',
        });
        return;
      }

      // Authenticate using secure server-side function
      const { data: authData, error: authError } = await supabase.rpc('authenticate_with_school_credentials', {
        _admission_no: schoolId,
        _first_name: firstName,
        _dob: formattedDob
      });

      // Record login attempt
      await supabase.rpc('record_login_attempt', {
        _identifier: schoolId,
        _success: !authError && authData && authData.length > 0
      });

      if (authError || !authData || authData.length === 0) {
        toast({
          title: 'Login failed',
          description: 'Invalid credentials. Please check your information.',
          variant: 'destructive',
        });
        return;
      }

      const user = authData[0];

      // Authenticate with Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: `${schoolId}-${formattedDob}` // Temporary password scheme
      });

      if (signInError) {
        toast({
          title: 'Authentication error',
          description: 'Session creation failed. Please contact support.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.full_name}!`,
      });

      // Navigate based on role
      setTimeout(() => {
        if (user.role === 'student') {
          navigate('/student-dashboard');
        } else if (user.role === 'teacher') {
          navigate('/teacher-dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin-dashboard');
        }
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
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
