import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, User, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    signIn(trimmed);
    toast({ title: `Welcome, ${trimmed}!` });
    navigate("/dashboard");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-primary-glow">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Memo<span className="text-gradient-gold">rie</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h1 className="text-xl font-display font-bold text-center text-foreground mb-1">
            What's your name?
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your name to get started — no account needed
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-display text-sm">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-background"
                  autoFocus
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display"
            >
              Let's Go 🎉
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
