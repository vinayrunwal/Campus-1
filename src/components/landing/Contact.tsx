import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, MapPin, Mail, Zap, ExternalLink } from "lucide-react";

const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      <div className="container relative mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block mb-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">
              Contact Us
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Get in <span className="gradient-text">touch</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg-custom p-px"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-px gradient-primary opacity-60" />

            <div className="rounded-3xl p-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                  <Zap size={20} className="text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Campus One Team</h3>
                  <p className="text-sm text-muted-foreground">Student Innovation Project</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Zap,
                    label: "Built by",
                    value: "Vineet and Team",
                    iconBg: "bg-primary/10",
                    iconColor: "text-primary",
                  },
                  {
                    icon: MapPin,
                    label: "Institution",
                    value: "MIT-ADT University, Pune",
                    iconBg: "bg-emerald-500/10",
                    iconColor: "text-emerald-600",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+91 8840456075",
                    href: "tel:+918840456075",
                    iconBg: "bg-blue-500/10",
                    iconColor: "text-blue-600",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "campusone007@gmail.com",
                    href: "mailto:campusone007@gmail.com",
                    iconBg: "bg-violet-500/10",
                    iconColor: "text-violet-600",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-4 rounded-2xl border border-border/50 bg-muted/30 p-4 ${item.href ? "cursor-pointer group" : ""} transition-all duration-200`}
                    onClick={() => item.href && window.open(item.href)}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                      <item.icon size={18} className={item.iconColor} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value}</p>
                    </div>
                    {item.href && (
                      <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
