import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const statCards = [
  {
    icon: BookOpen,
    value: "2,400+",
    label: "Notes Shared",
  },
  {
    icon: Calendar,
    value: "120+",
    label: "Events Active",
  },
  {
    icon: Briefcase,
    value: "85+",
    label: "Internships",
  },
];

const Hero = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const lightsY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 30, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const bgMouseX = useTransform(springX, [-0.5, 0.5], ["-4px", "4px"]);
  const bgMouseY = useTransform(springY, [-0.5, 0.5], ["-4px", "4px"]);

  const lightsMouseX = useTransform(springX, [-0.5, 0.5], ["3px", "-3px"]);
  const lightsMouseY = useTransform(springY, [-0.5, 0.5], ["3px", "-3px"]);

  const textMouseX = useTransform(springX, [-0.5, 0.5], ["-6px", "6px"]);
  const textMouseY = useTransform(springY, [-0.5, 0.5], ["-6px", "6px"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!targetRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = targetRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / width;
    const y = (clientY - (top + height / 2)) / height;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.section
      ref={targetRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden py-16 md:py-0"
      style={{ perspective: "1000px" }}
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <motion.div style={{ x: bgMouseX, y: bgMouseY }} className="absolute inset-0">
          <motion.img
            src="https://i.ibb.co/NgTPrCds/IT-Building2.jpg"
            alt="Campus"
            className="h-full w-full object-cover filter blur-[3px]"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.6)] via-[rgba(0,0,0,0.4)] to-[rgba(0,0,0,0.7)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5))]"/>
      </motion.div>

      <motion.div
        style={{ y: lightsY }}
        className="absolute inset-0 z-10 pointer-events-none"
      >
        <motion.div style={{ x: lightsMouseX, y: lightsMouseY }} className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[400px] h-[400px] sm:w-[800px] sm:h-[800px] bg-[radial-gradient(circle,rgba(100,100,255,0.15)_0%,rgba(100,100,255,0)_60%)]" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-20 flex flex-col items-center text-center px-4 pt-24 sm:pt-0"
      >
        <motion.div style={{ x: textMouseX, y: textMouseY }} className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-6xl md:text-7xl"
              style={{ textShadow: "0px 10px 40px rgba(0,0,0,0.85)" }}
            >
              <span className="block">CAMPUS ONE</span>
              <span className="block text-violet-400">All Campus Services</span>
              <span className="block">In One Smart Platform</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-lg text-slate-300 sm:text-xl"
          >
            Notes, internships, events, and more — all unified in one intelligent
            platform designed for modern students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link to="/login">
              <Button
                size="lg"
                className="h-12 w-full sm:w-auto px-8 rounded-xl text-white font-bold transition-all duration-300 hover:scale-105 shadow-glow bg-black/60 backdrop-blur-lg border border-white/20 hover:bg-black/80 hover:border-white/30"
              >
                Start for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full sm:w-auto px-8 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 w-full max-w-4xl mx-auto p-4 mt-12 sm:mt-8"
      >
        <div 
          className="grid grid-cols-3 gap-2 sm:gap-4 w-full"
          style={{
            background: "rgba(20,20,35,0.55)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            padding: "1rem",
          }}
        >
          {statCards.map((card) => (
            <div key={card.label} className="flex flex-col items-center text-center p-2 space-y-1">
              <card.icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-50" />
              <div>
                <p className="text-base sm:text-lg font-bold text-slate-50">{card.value}</p>
                <p className="text-xs text-slate-400">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
