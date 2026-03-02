import { BookOpen, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Memo<span className="text-gradient-gold">rie</span>
            </span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-accent fill-accent" /> for Indian colleges
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
