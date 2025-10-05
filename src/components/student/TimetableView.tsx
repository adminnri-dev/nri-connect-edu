import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen } from 'lucide-react';

export function TimetableView() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentClass, setStudentClass] = useState<any>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (user) {
      fetchStudentClassAndTimetable();
    }
  }, [user]);

  const fetchStudentClassAndTimetable = async () => {
    try {
      // Get student's enrolled class
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .select('class_id, classes(id, name, section, academic_year)')
        .eq('student_id', user?.id)
        .eq('status', 'active')
        .single();

      if (enrollmentError) throw enrollmentError;

      if (enrollmentData) {
        setStudentClass(enrollmentData.classes);

        // Fetch timetable for the class
        const { data: timetableData, error: timetableError } = await supabase
          .from('timetable')
          .select('*')
          .eq('class_id', enrollmentData.class_id)
          .order('day_of_week')
          .order('start_time');

        if (timetableError) throw timetableError;
        setTimetable(timetableData || []);
      }
    } catch (error: any) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimetableForDay = (day: string) => {
    return timetable.filter(item => item.day_of_week === day);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading timetable...</p>
        </CardContent>
      </Card>
    );
  }

  if (!studentClass) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You are not enrolled in any class yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Timetable</CardTitle>
          <CardDescription>
            {studentClass.name} - Section {studentClass.section} ({studentClass.academic_year})
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {daysOfWeek.map((day) => {
          const daySchedule = getTimetableForDay(day);
          
          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedule.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No classes scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {daySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            {item.subject}
                          </h4>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatTime(item.start_time)} - {formatTime(item.end_time)}
                            </span>
                          </div>
                          
                          {item.room_number && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>Room {item.room_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}