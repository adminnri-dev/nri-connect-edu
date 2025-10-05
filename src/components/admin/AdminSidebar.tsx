import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  ClipboardList, 
  FileText, 
  MessageSquare, 
  Megaphone,
  Settings,
  Library
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "#overview", icon: LayoutDashboard },
  { title: "Users", url: "#users", icon: Users },
  { title: "Students", url: "#students", icon: GraduationCap },
  { title: "Classes", url: "#classes", icon: BookOpen },
  { title: "Courses", url: "#courses", icon: BookOpen },
  { title: "Timetable", url: "#timetable", icon: Calendar },
  { title: "Attendance", url: "#attendance", icon: ClipboardList },
  { title: "Grades", url: "#grades", icon: FileText },
  { title: "Fee Management", url: "#fees", icon: DollarSign },
  { title: "Enrollments", url: "#enrollments", icon: Users },
  { title: "Report Cards", url: "#reports", icon: FileText },
  { title: "Events", url: "#events", icon: Calendar },
  { title: "Announcements", url: "#announcements", icon: Megaphone },
  { title: "Library", url: "#library", icon: Library },
  { title: "Messages", url: "#messages", icon: MessageSquare },
  { title: "Analytics", url: "#analytics", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}