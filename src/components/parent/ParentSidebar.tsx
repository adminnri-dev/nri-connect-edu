import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  FileText, 
  MessageSquare, 
  DollarSign,
  Users
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
  { title: "Children", url: "#children", icon: Users },
  { title: "Attendance", url: "#attendance", icon: ClipboardList },
  { title: "Grades", url: "#grades", icon: FileText },
  { title: "Fees", url: "#fees", icon: DollarSign },
  { title: "Report Cards", url: "#reports", icon: FileText },
  { title: "Messages", url: "#messages", icon: MessageSquare },
  { title: "Calendar", url: "#calendar", icon: Calendar },
];

export function ParentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Parent Menu</SidebarGroupLabel>
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