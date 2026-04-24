import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import {
  LayoutDashboard, BookOpen, Calendar, Briefcase,
  MessageSquare, Bell, Users, LogOut, ChevronLeft, ChevronRight,
  Shield, FileText, User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const studentNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Notes", path: "/dashboard/notes" },
  { icon: Calendar, label: "Events", path: "/dashboard/events" },
  { icon: Briefcase, label: "Internships", path: "/dashboard/internships" },
  { icon: MessageSquare, label: "Complaints", path: "/dashboard/complaints" },
  { icon: Bell, label: "Announcements", path: "/dashboard/announcements" },
  { icon: Users, label: "Clubs", path: "/dashboard/clubs" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

const adminNavItems = [
  { icon: Shield, label: "Admin Overview", path: "/dashboard/admin" },
  { icon: FileText, label: "Notes", path: "/dashboard/admin/notes" },
  { icon: Briefcase, label: "Internships", path: "/dashboard/admin/internships" },
  { icon: Calendar, label: "Events", path: "/dashboard/admin/events" },
  { icon: MessageSquare, label: "Complaints", path: "/dashboard/admin/complaints" },
  { icon: Bell, label: "Announcements", path: "/dashboard/admin/announcements" },
  { icon: Users, label: "Clubs", path: "/dashboard/admin/clubs" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useRole();

  const isAdminView = location.pathname.startsWith("/dashboard/admin");
  const navItems = isAdmin ? (isAdminView ? adminNavItems : studentNavItems) : studentNavItems;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 248 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 flex h-screen flex-col border-r border-sidebar-border bg-sidebar overflow-hidden"
    >
      {/* Header */}
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border/60">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <Link to="/" className="flex items-center gap-2.5 group">
                <Logo className="h-8 w-8" />
                <span className="text-sm font-bold tracking-tight text-foreground">
                  Campus <span className="gradient-text">One</span>
                </span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mx-auto"
            >
              <Link to="/">
                <Logo className="h-8 w-8" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role toggle */}
      {isAdmin && !collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex rounded-xl overflow-hidden border border-sidebar-border/60 bg-muted/30 p-0.5 gap-0.5">
            <Link
              to="/dashboard"
              className={cn(
                "flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition-all duration-200",
                !isAdminView
                  ? "gradient-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Student
            </Link>
            <Link
              to="/dashboard/admin"
              className={cn(
                "flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition-all duration-200",
                isAdminView
                  ? "gradient-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Admin
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {!collapsed && (
          <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">
            {isAdminView ? "Management" : "Navigation"}
          </p>
        )}
        {navItems.map((navItem) => {
          const active = navItem.path === "/dashboard"
            ? location.pathname === navItem.path
            : location.pathname.startsWith(navItem.path);
          return (
            <Link
              key={navItem.path}
              to={navItem.path}
              title={collapsed ? navItem.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <navItem.icon size={17} className={cn("shrink-0", active && "text-primary")} />
              {!collapsed && <span>{navItem.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer controls */}
      <div className="border-t border-sidebar-border/60 p-2.5 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
        </button>

        <button
          onClick={async () => { await signOut(); navigate('/login'); }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut size={16} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
