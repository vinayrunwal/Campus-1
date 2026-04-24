import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Bell, BookOpen, Briefcase, Calendar, CheckCircle, TrendingUp } from "lucide-react";

const DashboardMock = () => (
  <div className="relative w-full rounded-2xl overflow-hidden border border-border/60 shadow-lg-custom bg-card">
    {/* Window chrome */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
      <div className="w-3 h-3 rounded-full bg-destructive/60" />
      <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
      <div className="w-3 h-3 rounded-full bg-green-400/60" />
      <div className="mx-auto flex items-center gap-2 bg-background/60 rounded-full px-4 py-1.5 text-xs text-muted-foreground border border-border/40">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        campusone.app/dashboard
      </div>
    </div>

    <div className="flex h-72">
      {/* Sidebar mock */}
      <div className="w-14 border-r border-border/60 bg-sidebar py-4 flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <span className="text-white text-xs font-bold">C1</span>
        </div>
        {[TrendingUp, BookOpen, Calendar, Briefcase, Bell].map((Icon, i) => (
          <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-primary/15" : "hover:bg-muted"} cursor-pointer`}>
            <Icon size={14} className={i === 0 ? "text-primary" : "text-muted-foreground"} />
          </div>
        ))}
      </div>

      {/* Main content mock */}
      <div className="flex-1 p-5 overflow-hidden">
        <div className="mb-4">
          <div className="h-5 w-48 rounded-full bg-muted mb-1" />
          <div className="h-3 w-32 rounded-full bg-muted/60" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { color: "bg-violet-500/10 border-violet-500/20 text-violet-600", val: "24", label: "Notes" },
            { color: "bg-blue-500/10 border-blue-500/20 text-blue-600", val: "8", label: "Events" },
            { color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600", val: "12", label: "Jobs" },
            { color: "bg-primary/10 border-primary/20 text-primary", val: "3", label: "Alerts" },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-2 ${s.color}`}>
              <p className="text-lg font-bold">{s.val}</p>
              <p className="text-xs opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Content rows */}
        <div className="space-y-2">
          {[
            { w: "w-3/4", accent: true },
            { w: "w-1/2", accent: false },
            { w: "w-5/6", accent: false },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <CheckCircle size={12} className={row.accent ? "text-primary" : "text-muted-foreground"} />
              <div className={`h-2.5 ${row.w} rounded-full bg-muted`} />
              <div className="ml-auto h-2 w-10 rounded-full bg-primary/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PlatformPreview = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="preview" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.05),transparent)]" />

      <div className="container relative mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block mb-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">
              Platform Preview
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Designed for{" "}
              <span className="gradient-text">clarity</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              A clean, modern interface that gets out of the way so you can focus on what matters.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mx-auto max-w-3xl"
        >
          <div className="relative">
            {/* Glow behind */}
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-110" />
            <DashboardMock />
          </div>
        </motion.div>

        {/* Feature highlights below */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "Role-based access", desc: "Students, Admins, TPO & Club Managers" },
            { label: "Real-time data", desc: "Live updates powered by PostgreSQL" },
            { label: "Verified content", desc: "Everything approved before going live" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="glass rounded-xl border border-border/50 p-4 text-center"
            >
              <p className="font-semibold text-foreground text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformPreview;
