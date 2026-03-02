import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/templates" },
  { label: "Dashboard", href: "/dashboard" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center shadow-primary-glow">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Memo<span className="text-gradient-gold">rie</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground truncate max-w-[160px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground" asChild>
                <Link to="/login">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-card border-t border-border"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-2 text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2 border-t border-border">
              {user ? (
                <Button variant="ghost" size="sm" className="flex-1" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Log out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-hero text-primary-foreground" asChild>
                    <Link to="/login">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
