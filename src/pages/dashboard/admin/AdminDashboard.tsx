import { motion } from "framer-motion";
import { FileText, Briefcase, MessageSquare, Bell, Users, BookOpen, Loader2, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const [pendingNotes, pendingInternships, openComplaints, announcements, clubs, events] = await Promise.all([
        supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("internships").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).in("status", ["open", "in-progress"]),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("clubs").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      return {
        pendingNotes: pendingNotes.count ?? 0,
        pendingInternships: pendingInternships.count ?? 0,
        openComplaints: openComplaints.count ?? 0,
        announcements: announcements.count ?? 0,
        clubs: clubs.count ?? 0,
        events: events.count ?? 0,
      };
    },
  });

  const cards = [
    { icon: FileText, label: "Pending Notes", value: stats?.pendingNotes, link: "/dashboard/admin/notes", badge: stats?.pendingNotes ?? 0, color: "text-primary" },
    { icon: Briefcase, label: "Pending Internships", value: stats?.pendingInternships, link: "/dashboard/admin/internships", badge: stats?.pendingInternships ?? 0, color: "text-primary" },
    { icon: MessageSquare, label: "Open Complaints", value: stats?.openComplaints, link: "/dashboard/admin/complaints", badge: 0, color: "text-primary" },
    { icon: Bell, label: "Announcements", value: stats?.announcements, link: "/dashboard/admin/announcements", badge: 0, color: "text-primary" },
    { icon: Users, label: "Clubs", value: stats?.clubs, link: "/dashboard/admin/clubs", badge: 0, color: "text-primary" },
    { icon: BookOpen, label: "Active Events", value: stats?.events, link: "/dashboard/admin/events", badge: 0, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage content and moderate the platform.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }} whileHover={{ y: -2 }}>
            <Link to={card.link}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex items-start justify-between">
                <card.icon size={20} className={card.color} />
                {card.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {stats === undefined ? <Loader2 size={20} className="animate-spin" /> : card.value}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{card.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
