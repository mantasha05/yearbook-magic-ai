import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";

const CreateProject = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    college: "",
    batch: "",
    department: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/upload");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-primary-glow mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Create New Yearbook
              </h1>
              <p className="text-muted-foreground mt-1">
                Set up your yearbook project details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-display font-medium">
                  Project Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., CSE Batch 2025 Yearbook"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college" className="font-display font-medium">
                  College / University
                </Label>
                <Input
                  id="college"
                  placeholder="e.g., IIT Delhi"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch" className="font-display font-medium">
                    Batch / Year
                  </Label>
                  <Input
                    id="batch"
                    placeholder="e.g., 2025"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="font-display font-medium">
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., CSE"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12"
              >
                Continue to Upload
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
