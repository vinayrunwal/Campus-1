import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, CheckCircle, LayoutDashboard, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account with your university email. Verify and set your role as Student, Admin, TPO, or Club Manager.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    step: "02",
    icon: LayoutDashboard,
    title: "Access Dashboard",
    description: "Log in to your personalized dashboard. See announcements, events, and everything relevant to your role instantly.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Admin Verifies",
    description: "Admins review uploaded notes, internships, and events before they go live, ensuring quality and authenticity.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    step: "04",
    icon: Sparkles,
    title: "Students Thrive",
    description: "Access verified content, apply for internships, register for events, and collaborate with your campus community.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      <div className="container relative mx-auto px-6">
        <div className="mx-auto mb-20 max-w-2xl text-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block mb-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">
              How It Works
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              From signup to{" "}
              <span className="gradient-text">campus hero</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Four simple steps to transform your student experience.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Connector line */}
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="absolute top-12 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Icon circle */}
                <div className={`relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${step.bg} border ${step.border} glass transition-all duration-300 hover:scale-110`}>
                  <step.icon size={28} className={step.color} />
                  <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                    {step.step}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
