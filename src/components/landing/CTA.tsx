import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-px shadow-glow"
        >
          {/* Gradient border */}
          <div className="absolute inset-0 gradient-primary rounded-3xl" />
          
          {/* Inner card */}
          <div className="relative rounded-3xl bg-foreground px-10 py-20 text-center overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--background)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--background)/0.04)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.15),transparent)]" />

            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow"
              >
                <Sparkles size={24} className="text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-background md:text-4xl lg:text-5xl tracking-tight">
                Ready to transform
                <br />
                your campus life?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-background/60 leading-relaxed">
                Join thousands of students already using Campus One to stay organized, connected, and never miss what matters.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="h-12 gap-2 px-10 bg-background text-foreground font-semibold hover:bg-background/90 transition-all duration-300 rounded-xl shadow-lg hover:scale-105"
                  >
                    Start for free <ArrowRight size={16} />
                  </Button>
                </Link>
                <a href="#features">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-12 px-8 text-background/70 hover:text-background hover:bg-background/10 rounded-xl"
                  >
                    Explore features
                  </Button>
                </a>
              </div>
              <p className="mt-6 text-xs text-background/40">No credit card required · Free forever for students</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
