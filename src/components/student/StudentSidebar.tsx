import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  FileText, 
  MessageSquare, 
  Library,
  DollarSign
} from "lucide-react";
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
  { title: "Timetable", url: "#timetable", icon: Calendar },
  { title: "Attendance", url: "#attendance", icon: ClipboardList },
  { title: "Grades", url: "#grades", icon: FileText },
  { title: "Fees", url: "#fees", icon: DollarSign },
  { title: "Library", url: "#library", icon: Library },
  { title: "Messages", url: "#messages", icon: MessageSquare },
  { title: "Calendar", url: "#calendar", icon: Calendar },
];

export function StudentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Student Menu</SidebarGroupLabel>
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