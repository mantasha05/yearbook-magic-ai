import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { step: "01", title: "Upload Content", description: "Drag & drop photos, quotes, and achievements in bulk" },
  { step: "02", title: "Pick a Template", description: "Choose from beautiful, professional yearbook templates" },
  { step: "03", title: "Auto Generate", description: "AI creates your layout — preview and tweak as needed" },
  { step: "04", title: "Export & Share", description: "Download print-ready PDF or share an interactive flip-book" },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-display font-semibold text-accent uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3 text-foreground">
            Four Simple Steps to Your Yearbook
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="text-6xl font-display font-bold text-gradient-gold opacity-30 mb-2">
                {s.step}
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-8 -right-4 w-6 h-6 text-accent" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8"
            asChild
          >
            <Link to="/dashboard">
              Start Creating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
