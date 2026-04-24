import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (v) => setScrolled(v > 50));
    return unsubscribe;
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div
        className={cn(
          "container mx-auto flex h-20 items-center justify-between px-6 transition-all duration-300",
          scrolled && "mt-2"
        )}
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-white">
            Campus One
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={cn(
            "hidden items-center gap-1 rounded-[14px] md:flex",
            isHomepage
              ? "bg-[rgba(20,20,30,0.45)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.15)] py-2 px-4"
              : "px-3 py-2",
            !isHomepage &&
              scrolled &&
              "bg-[rgba(20,20,30,0.45)] backdrop-blur-xl border border-white/10"
          )}
        >
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Preview", href: "#preview" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:text-violet-400 rounded-lg"
            >
              {item.label}
            </a>
          ))}
        </motion.div>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button
              variant="ghost"
              className="text-sm font-medium text-slate-100 hover:text-violet-400 rounded-xl px-5 py-2.5 transition-all duration-300 ease-in-out transform hover:scale-105 border border-white/25 bg-[rgba(20,20,30,0.45)] backdrop-blur-[10px] hover:bg-[rgba(30,30,45,0.6)] hover:border-violet-400/50"
            >
              Log in
            </Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="bg-white text-black font-bold hover:bg-gray-200">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[rgba(0,0,0,0.8)] border-t border-white/10 backdrop-blur-xl px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {["Features", "How It Works", "Preview", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-slate-200 hover:text-violet-400 transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 flex flex-col gap-3">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white text-black hover:bg-gray-100"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button
                  size="sm"
                  className="w-full bg-white text-black font-bold hover:bg-gray-200"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
