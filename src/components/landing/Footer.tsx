import { Link } from "react-router-dom";
import { Zap, Github, Twitter } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/30">
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Zap size={13} className="text-white fill-white" />
          </div>
          <span className="font-bold text-foreground tracking-tight">
            Campus <span className="gradient-text">One</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {["Features", "How It Works", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
          <Link to="/login" className="hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Campus One · MIT-ADT University
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
