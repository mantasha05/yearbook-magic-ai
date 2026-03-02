import { useEffect, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  MessageSquare,
  Award,
  Camera,
  Laugh,
  Heart,
  QrCode,
  Trash2,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useProject, type ProjectSection } from "@/hooks/use-project";
import { toast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare,
  Award,
  Camera,
  Laugh,
  Heart,
  QrCode,
};

const SectionBuilder = () => {
  const navigate = useNavigate();
  const { project, sections, loading, toggleSection, reorderSections, removeSection, saveSections } = useProject();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleReorder = (newOrder: ProjectSection[]) => {
    // Debounced auto-save
    reorderSections(newOrder);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      toast({ title: "Order saved", description: "Section order updated automatically" });
    }, 1000);
  };

  const handleGenerate = () => {
    const enabledSections = sections.filter((s) => s.enabled);
    if (enabledSections.length === 0) {
      toast({
        title: "No sections enabled",
        description: "Please enable at least one section before generating.",
        variant: "destructive",
      });
      return;
    }
    navigate("/generate");
  };

  const handleSave = () => {
    saveSections(sections);
    toast({ title: "Project saved!", description: "All sections and settings have been saved." });
  };

  if (loading) {
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
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Build Your Sections
              </h1>
              <p className="text-muted-foreground mt-1">
                Drag to reorder, toggle on/off, or add custom sections
              </p>
            </div>

            <Reorder.Group
              axis="y"
              values={sections}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {sections.map((section) => {
                const Icon = ICON_MAP[section.icon_name] || MessageSquare;
                return (
                  <Reorder.Item
                    key={section.id}
                    value={section}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                      section.enabled
                        ? "bg-card border-border shadow-card hover:shadow-card-hover"
                        : "bg-muted/50 border-border/50 opacity-60"
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />

                    <div
                      className={`flex-1 flex items-center gap-3 cursor-pointer ${
                        section.enabled ? "" : "pointer-events-none"
                      }`}
                      onClick={() => section.enabled && navigate(`/sections/${section.section_key}`)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        section.enabled ? "bg-gradient-hero" : "bg-muted"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          section.enabled ? "text-primary-foreground" : "text-muted-foreground"
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`font-display font-medium block ${
                          section.enabled ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {section.title}
                        </span>
                        {section.enabled && (
                          <span className="text-xs text-muted-foreground">Click to edit →</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSection(section.section_key); }}
                      className={`px-3 py-1 rounded-md text-xs font-display font-semibold transition-colors ${
                        section.enabled
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {section.enabled ? "ON" : "OFF"}
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* Add custom section */}
            <button className="w-full mt-4 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-display font-medium">Add Custom Section</span>
            </button>

            {/* Actions */}
            <div className="flex items-center justify-between mt-10 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="font-display h-12 px-6"
                onClick={handleSave}
              >
                <Save className="w-5 h-5 mr-2" />
                Save Project
              </Button>

              <Button
                size="lg"
                className="bg-gradient-gold shadow-gold-glow hover:opacity-90 text-accent-foreground font-display font-semibold h-12 px-8"
                onClick={handleGenerate}
              >
                Generate Yearbook
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SectionBuilder;
