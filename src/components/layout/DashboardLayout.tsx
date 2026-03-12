import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleLabel } from "@/lib/role-labels";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "@/components/ProfileAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Menu,
  LogOut,
  User,
  Home,
  FileText,
  Users,
  Building2,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppRole } from "@/lib/supabase";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const getNavItems = (role: AppRole): NavItem[] => {
  const baseItems: NavItem[] = [
    { label: "Dashboard", href: `/${role === "coordinator" ? "coordinator" : role}`, icon: <Home className="w-5 h-5" /> },
  ];

  switch (role) {
    case "student":
      return [
        ...baseItems,
        { label: "My Logs", href: "/student/logs", icon: <FileText className="w-5 h-5" /> },
        { label: "Attachment Setup", href: "/student/attachment-setup", icon: <ClipboardList className="w-5 h-5" /> },
      ];
    case "supervisor":
      return [
        ...baseItems,
        { label: "Students", href: "/supervisor/students", icon: <Users className="w-5 h-5" /> },
        { label: "Review Logs", href: "/supervisor/logs", icon: <FileText className="w-5 h-5" /> },
      ];
    case "coordinator":
      return [
        ...baseItems,
        { label: "Students", href: "/coordinator/students", icon: <Users className="w-5 h-5" /> },
        { label: "Student Logs", href: "/coordinator/logs", icon: <FileText className="w-5 h-5" /> },
        { label: "Placements", href: "/coordinator/placements", icon: <ClipboardList className="w-5 h-5" /> },
        { label: "Reports", href: "/coordinator/reports", icon: <BarChart3 className="w-5 h-5" /> },
      ];
    case "admin":
      return [
        ...baseItems,
        { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { label: "Organizations", href: "/admin/organizations", icon: <Building2 className="w-5 h-5" /> },
        { label: "Placements", href: "/admin/placements", icon: <ClipboardList className="w-5 h-5" /> },
        { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
      ];
    default:
      return baseItems;
  }
};

const getProfilePath = (role: AppRole) => {
  switch (role) {
    case "student": return "/student/profile";
    default: return `/${role === "coordinator" ? "coordinator" : role}`;
  }
};

const getSettingsPath = (role: AppRole) => {
  switch (role) {
    case "student": return "/student/settings";
    case "admin": return "/admin/settings";
    default: return `/${role === "coordinator" ? "coordinator" : role}`;
  }
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, primaryRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = getNavItems(primaryRole);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = profile?.full_name || "User";

  return (
    <div className="min-h-screen bg-muted/30">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">
              Track<span className="text-primary">My</span>Attachment
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-2 py-2">
              <ProfileAvatar name={displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(primaryRole)}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <ProfileAvatar name={displayName} size="sm" />
                  <span className="hidden sm:inline font-medium">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getProfilePath(primaryRole))}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(getSettingsPath(primaryRole))}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
