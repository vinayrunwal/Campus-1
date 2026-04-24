import { motion, type Variants } from "framer-motion";
import { BookOpen, Calendar, Briefcase, Bell, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const DashboardHome = () => {
  const { user } = useAuth();
  const { role } = useRole();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();
      return data;
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements_home"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events_home"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("status", "active").order("event_date", { ascending: true }).limit(3);
      return data ?? [];
    },
  });

  const { data: internships = [] } = useQuery({
    queryKey: ["internships_home"],
    queryFn: async () => {
      const { data } = await supabase.from("internships").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(2);
      return data ?? [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const [ann, evts, interns, notes] = await Promise.all([
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("internships").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      return {
        announcements: ann.count ?? 0,
        events: evts.count ?? 0,
        internships: interns.count ?? 0,
        notes: notes.count ?? 0,
      };
    },
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const eventTypeStyles: Record<string, { bg: string; text: string }> = {
    Hackathon: { bg: "bg-violet-500/10", text: "text-violet-600" },
    Workshop: { bg: "bg-blue-500/10", text: "text-blue-600" },
    Festival: { bg: "bg-orange-500/10", text: "text-orange-600" },
    Competition: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  };

  const statCards = [
    { icon: Bell, label: "Announcements", value: stats?.announcements ?? "—", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
    { icon: Calendar, label: "Active Events", value: stats?.events ?? "—", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { icon: Briefcase, label: "Open Internships", value: stats?.internships ?? "—", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { icon: BookOpen, label: "Approved Notes", value: stats?.notes ?? "—", color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Greeting */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {greeting()}, {profile?.full_name?.split(" ")[0] ?? "Student"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening on campus today.</p>
          {role && role !== "student" && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-white capitalize">
              <Zap size={10} className="fill-white" />
              {role} account
            </div>
          )}
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-2 shadow-card">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Campus Activity</span>
          <span className="text-xs font-bold text-primary">Live</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl border bg-card p-5 shadow-card ${s.bg} transition-all`}
          >
            <div className={`inline-flex rounded-xl ${s.bg} p-2 mb-3`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Announcements */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Latest Announcements</h2>
          <Link
            to="/dashboard/announcements"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <motion.div
                key={a.id}
                whileHover={{ x: 3 }}
                className="flex items-start justify-between rounded-xl border border-border/50 bg-card p-4 shadow-card transition-all hover:border-primary/20 hover:bg-accent/30"
              >
                <div className="flex items-start gap-3">
                  {a.urgent && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive animate-pulse" />
                  )}
                  {!a.urgent && (
                    <Bell size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">{a.title}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground ml-4">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Events */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Upcoming Events</h2>
          <Link
            to="/dashboard/events"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            No upcoming events.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {events.map((e) => {
              const style = eventTypeStyles[e.type] ?? { bg: "bg-muted/60", text: "text-muted-foreground" };
              return (
                <motion.div
                  key={e.id}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-border/50 bg-card p-5 shadow-card transition-all hover:border-primary/20 hover:shadow-md-custom"
                >
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
                    {e.type}
                  </span>
                  <h3 className="mt-3 font-semibold text-foreground text-sm leading-snug">{e.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{e.location}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Internships */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Latest Internships</h2>
          <Link
            to="/dashboard/internships"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {internships.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            No open internships yet.
          </div>
        ) : (
          <div className="space-y-2">
            {internships.map((i) => (
              <motion.div
                key={i.id}
                whileHover={{ x: 3 }}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 shadow-card transition-all hover:border-primary/20 hover:bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                    <Briefcase size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{i.role}</p>
                    <p className="text-xs text-muted-foreground">{i.company} · {i.location}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{i.stipend}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
