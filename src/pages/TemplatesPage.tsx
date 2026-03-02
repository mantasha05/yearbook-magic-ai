import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const templates = [
  {
    id: "minimal",
    name: "Clean Minimal",
    description: "Elegant whitespace, subtle typography, modern feel",
    colors: ["#1a1a2e", "#ffffff", "#e8e8e8", "#f0c040"],
    popular: false,
  },
  {
    id: "vibrant",
    name: "Vibrant Campus",
    description: "Bold colors, energetic layouts, perfect for lively batches",
    colors: ["#3b47d9", "#ff6b35", "#ffd23f", "#06d6a0"],
    popular: true,
  },
  {
    id: "classic",
    name: "Classic Elegant",
    description: "Timeless design with gold accents and serif typography",
    colors: ["#1a1a2e", "#c8a951", "#f5f0e6", "#2d2d44"],
    popular: false,
  },
  {
    id: "gradient",
    name: "Gradient Flow",
    description: "Smooth gradients, glassy cards, futuristic vibe",
    colors: ["#667eea", "#764ba2", "#f093fb", "#ffecd2"],
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
  const [selected, setSelected] = useState("vibrant");

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
                  {/* Color preview header */}
                  <div className="h-32 relative overflow-hidden">
                    <div className="absolute inset-0 flex">
                      {tpl.colors.map((color, ci) => (
                        <div
                          key={ci}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />

                    {/* Popular badge */}
                    {tpl.popular && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-accent-foreground text-xs font-display font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Popular
                      </div>
                    )}

                    {/* Selected check */}
                    {selected === tpl.id && (
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-card">
                    <h3 className="font-display font-semibold text-card-foreground">
                      {tpl.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tpl.description}
                    </p>
                    {/* Color swatches */}
                    <div className="flex gap-1.5 mt-3">
                      {tpl.colors.map((color, ci) => (
                        <div
                          key={ci}
                          className="w-5 h-5 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Continue */}
            <div className="flex justify-end mt-10">
              <Button
                size="lg"
                className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8"
                onClick={() => navigate("/sections")}
              >
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
