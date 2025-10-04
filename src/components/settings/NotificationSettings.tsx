import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

export default function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [gradeNotifications, setGradeNotifications] = useState(true);
  const [attendanceNotifications, setAttendanceNotifications] = useState(true);
  const [announcementNotifications, setAnnouncementNotifications] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="grade-notifications">Grade Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when grades are posted
            </p>
          </div>
          <Switch
            id="grade-notifications"
            checked={gradeNotifications}
            onCheckedChange={setGradeNotifications}
            disabled={!emailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="attendance-notifications">Attendance Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts for attendance issues
            </p>
          </div>
          <Switch
            id="attendance-notifications"
            checked={attendanceNotifications}
            onCheckedChange={setAttendanceNotifications}
            disabled={!emailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="announcement-notifications">Announcements</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about new announcements
            </p>
          </div>
          <Switch
            id="announcement-notifications"
            checked={announcementNotifications}
            onCheckedChange={setAnnouncementNotifications}
            disabled={!emailNotifications}
          />
        </div>
      </CardContent>
    </Card>
  );
}
