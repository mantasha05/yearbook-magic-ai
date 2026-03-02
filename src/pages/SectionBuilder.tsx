import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  enabled: boolean;
}

const defaultSections: Section[] = [
  { id: "principal", title: "Principal's Message", icon: MessageSquare, enabled: true },
  { id: "toppers", title: "Academic Stars & Toppers", icon: Award, enabled: true },
  { id: "events", title: "Events Gallery", icon: Camera, enabled: true },
  { id: "memes", title: "Fun Memes & Candid Moments", icon: Laugh, enabled: true },
  { id: "farewell", title: "Farewell & Memories", icon: Heart, enabled: true },
  { id: "qr", title: "QR Code - College Anthem", icon: QrCode, enabled: true },
];

const SectionBuilder = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>(defaultSections);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

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
              onReorder={setSections}
              className="space-y-3"
            >
              {sections.map((section) => (
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
                    onClick={() => section.enabled && navigate(`/sections/${section.id}`)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      section.enabled ? "bg-gradient-hero" : "bg-muted"
                    }`}>
                      <section.icon className={`w-5 h-5 ${
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
                    onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
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
              ))}
            </Reorder.Group>

            {/* Add custom section */}
            <button className="w-full mt-4 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-display font-medium">Add Custom Section</span>
            </button>

            {/* Continue */}
            <div className="flex justify-end mt-10">
              <Button
                size="lg"
                className="bg-gradient-gold shadow-gold-glow hover:opacity-90 text-accent-foreground font-display font-semibold h-12 px-8"
                onClick={() => navigate("/dashboard")}
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
