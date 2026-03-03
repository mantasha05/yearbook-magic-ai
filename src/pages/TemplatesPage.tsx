import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useProject } from "@/hooks/use-project";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const templates = [
  {
    id: "modern-magazine",
    name: "Modern Magazine",
    description: "Bold editorial layouts, clean modern aesthetic",
    colors: ["#3730a3", "#1e1b4b", "#6366f1", "#c7d2fe"],
    popular: true,
  },
  {
    id: "sparkly-memories",
    name: "Sparkly Memories",
    description: "Warm gold accents, dreamy and nostalgic vibes",
    colors: ["#d97706", "#f59e0b", "#fde68a", "#fffbeb"],
    popular: false,
  },
  {
    id: "elegant-classic",
    name: "Elegant Classic",
    description: "Timeless design with serif typography and dark tones",
    colors: ["#1f2937", "#111827", "#6b7280", "#f3f4f6"],
    popular: false,
  },
  {
    id: "vibrant-pop",
    name: "Vibrant Pop",
    description: "Bold colors, energetic layouts, perfect for lively batches",
    colors: ["#7c3aed", "#ec4899", "#f472b6", "#fce7f3"],
    popular: false,
  },
  {
    id: "retro",
    name: "Retro Nostalgia",
    description: "Vintage tones, film grain textures, throwback aesthetic",
    colors: ["#e8d5b7", "#8b4513", "#d4a056", "#4a3728"],
    popular: false,
  },
  {
    id: "neon",
    name: "Neon Nights",
    description: "Dark theme with neon highlights, perfect for CS & tech batches",
    colors: ["#0d0d1a", "#00ff88", "#ff0088", "#0088ff"],
    popular: false,
  },
];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { project, loading: projectLoading } = useProject();
  const [selected, setSelected] = useState("modern-magazine");
  const [saving, setSaving] = useState(false);

  // Load saved template from project
  useEffect(() => {
    if (project?.template) {
      const exists = templates.find((t) => t.id === project.template);
      if (exists) setSelected(project.template);
    }
  }, [project]);

  const handleContinue = async () => {
    if (!project) return;
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({ template: selected, updated_at: new Date().toISOString() })
      .eq("id", project.id);

    if (error) {
      toast({ title: "Failed to save template", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    setSaving(false);
    navigate("/sections");
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </Link>

            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Choose a Template
              </h1>
              <p className="text-muted-foreground mt-1">
                Pick a style that matches your batch's personality
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl, i) => (
                <motion.button
                  key={tpl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelected(tpl.id)}
                  className={`group relative text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    selected === tpl.id
                      ? "border-primary shadow-primary-glow scale-[1.02]"
                      : "border-border shadow-card hover:shadow-card-hover hover:-translate-y-1"
                  }`}
                >
                  <div className="h-32 relative overflow-hidden">
                    <div className="absolute inset-0 flex">
                      {tpl.colors.map((color, ci) => (
                        <div key={ci} className="flex-1" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />

                    {tpl.popular && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-accent-foreground text-xs font-display font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Popular
                      </div>
                    )}

                    {selected === tpl.id && (
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-card">
                    <h3 className="font-display font-semibold text-card-foreground">{tpl.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{tpl.description}</p>
                    <div className="flex gap-1.5 mt-3">
                      {tpl.colors.map((color, ci) => (
                        <div key={ci} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-end mt-10">
              <Button
                size="lg"
                className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8"
                onClick={handleContinue}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Continue to Sections
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TemplatesPage;
