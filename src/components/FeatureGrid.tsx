import { motion } from "framer-motion";
import {
  Upload,
  Layout,
  Wand2,
  FileDown,
  BookOpen,
  Search,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Bulk Upload",
    description: "Drag & drop hundreds of photos, quotes, and achievements. Auto-organized by category.",
  },
  {
    icon: Wand2,
    title: "AI Smart Layout",
    description: "Intelligent auto-layout creates professional magazine pages. No design skills needed.",
  },
  {
    icon: Layout,
    title: "Beautiful Templates",
    description: "Choose from 6+ stunning templates — minimal, vibrant, elegant, and more.",
  },
  {
    icon: BookOpen,
    title: "Interactive Flip-Book",
    description: "Generate a shareable online flip-book with page-turn animation for mobile & desktop.",
  },
  {
    icon: FileDown,
    title: "Print-Ready PDF",
    description: "Export high-resolution A4 PDF with bleed marks, ready for professional printing.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find any student by name or roll number instantly across all yearbook pages.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeatureGrid = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-display font-semibold text-accent uppercase tracking-widest">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-3 mb-4 text-foreground">
            Everything You Need to Create a
            <br />
            <span className="text-gradient-hero">Stunning Yearbook</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From bulk uploads to AI-powered layouts — YearGen handles the heavy lifting so you can focus on the memories.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 shadow-primary-glow group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
