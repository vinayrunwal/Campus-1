import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Calendar, Briefcase, MessageSquare, Bell, Users } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Notes Sharing",
    description: "Upload and download notes filtered by subject and semester. PDF, DOC, and PPT support with admin verification.",
    gradient: "from-violet-500/15 to-purple-500/10",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
    border: "hover:border-violet-500/30",
    tag: "Academics",
  },
  {
    icon: Briefcase,
    title: "Internship Portal",
    description: "Browse TPO-verified opportunities. Apply, track status, and access direct company apply links in real time.",
    gradient: "from-blue-500/15 to-cyan-500/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    border: "hover:border-blue-500/30",
    tag: "Career",
  },
  {
    icon: Calendar,
    title: "Events & Hackathons",
    description: "Discover workshops, fests, and hackathons. Register with one click and get reminders so you never miss out.",
    gradient: "from-emerald-500/15 to-teal-500/10",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    border: "hover:border-emerald-500/30",
    tag: "Campus Life",
  },
  {
    icon: MessageSquare,
    title: "Complaint System",
    description: "Report hostel, WiFi, or facility issues digitally. Track resolution status and receive admin updates.",
    gradient: "from-orange-500/15 to-amber-500/10",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
    border: "hover:border-orange-500/30",
    tag: "Support",
  },
  {
    icon: Bell,
    title: "Announcements",
    description: "Official institution announcements delivered instantly to your dashboard. Urgent notices highlighted.",
    gradient: "from-rose-500/15 to-pink-500/10",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
    border: "hover:border-rose-500/30",
    tag: "Notifications",
  },
  {
    icon: Users,
    title: "Club Activities",
    description: "Explore student clubs, join communities, and stay updated on meetings, drives, and collaborations.",
    gradient: "from-primary/15 to-primary-glow/10",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    border: "hover:border-primary/30",
    tag: "Community",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover-lift ${feature.border} cursor-default`}
    >
      {/* Gradient bg on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative">
        {/* Tag */}
        <span className={`inline-block mb-4 rounded-full ${feature.iconBg} px-2.5 py-0.5 text-xs font-medium ${feature.iconColor}`}>
          {feature.tag}
        </span>
        
        {/* Icon */}
        <div className={`mb-4 inline-flex rounded-xl ${feature.iconBg} p-3 transition-transform duration-300 group-hover:scale-110`}>
          <feature.icon size={20} className={feature.iconColor} />
        </div>
        
        <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(var(--primary)/0.04),transparent)]" />
      <div className="container relative mx-auto px-6">
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block mb-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">
              Everything Included
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Six modules.{" "}
              <span className="gradient-text">One platform.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Everything a student needs, unified in a single, beautifully designed experience.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
