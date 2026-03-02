import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { useProject } from "@/hooks/use-project";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface UploadItem {
  id: string;
  file_name: string;
  public_url: string;
  category: string;
  created_at: string;
}

type GenerationStatus = "idle" | "collecting" | "generating" | "done" | "error";

const GeneratePage = () => {
  const { user } = useAuth();
  const { project, sections, loading: projectLoading } = useProject();
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<Record<string, UploadItem[]>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const enabledSections = sections.filter((s) => s.enabled);

  // Load all uploads for the user, grouped by section
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("uploads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data) {
        const grouped: Record<string, UploadItem[]> = {};
        data.forEach((u: any) => {
          if (!grouped[u.category]) grouped[u.category] = [];
          grouped[u.category].push(u);
        });
        setUploads(grouped);
      }
    };
    load();
  }, [user]);

  const handleGenerate = async () => {
    // Validate: at least one section has content
    const hasContent = enabledSections.some(
      (s) => (uploads[s.section_key] || []).length > 0
    );

    if (!hasContent) {
      toast({
        title: "No content uploaded",
        description: "Please upload photos/content to at least one section before generating.",
        variant: "destructive",
      });
      return;
    }

    setStatus("collecting");
    setProgress(0);
    setErrorMsg("");

    try {
      // Phase 1: Collecting data
      for (let i = 0; i <= 40; i += 5) {
        await new Promise((r) => setTimeout(r, 150));
        setProgress(i);
      }

      setStatus("generating");

      // Phase 2: Generating pages
      for (let i = 40; i <= 100; i += 3) {
        await new Promise((r) => setTimeout(r, 200));
        setProgress(i);
      }

      setStatus("done");
      setCurrentPage(0);
      toast({ title: "Yearbook generated! 🎉", description: "Your yearbook is ready to preview and download." });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Generation failed. Please try again.");
      toast({
        title: "Generation failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Build pages for the flipbook preview
  const buildPages = () => {
    const pages: { title: string; images: UploadItem[] }[] = [];
    enabledSections.forEach((section) => {
      const sectionUploads = uploads[section.section_key] || [];
      if (sectionUploads.length > 0) {
        pages.push({ title: section.title, images: sectionUploads });
      }
    });
    return pages;
  };

  const pages = buildPages();

  const handleDownloadPDF = () => {
    // Create a simple printable HTML and trigger print/save as PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Pop-up blocked", description: "Please allow pop-ups to download PDF.", variant: "destructive" });
      return;
    }

    const pagesHtml = pages
      .map(
        (page) => `
        <div style="page-break-after: always; padding: 40px; font-family: 'Space Grotesk', sans-serif;">
          <h2 style="font-size: 28px; margin-bottom: 24px; color: #2d2d6b; border-bottom: 3px solid #d4a017; padding-bottom: 8px;">${page.title}</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            ${page.images.map((img) => `<img src="${img.public_url}" style="width: 100%; border-radius: 8px; object-fit: cover; aspect-ratio: 4/3;" />`).join("")}
          </div>
        </div>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project?.name || "Memorie Yearbook"}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
            body { margin: 0; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div style="text-align: center; padding: 80px 40px; page-break-after: always; background: linear-gradient(135deg, #3730a3, #1e1b4b);">
            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 48px; color: #d4a017; margin-bottom: 16px;">${project?.name || "Memorie Yearbook"}</h1>
            <p style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; color: #e0e0ff;">Created with Memorie</p>
          </div>
          ${pagesHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
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
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/sections"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sections
            </Link>

            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Generate Your Yearbook
              </h1>
              <p className="text-muted-foreground mt-1">
                {project?.name} • {enabledSections.length} sections ready
              </p>
            </div>

            {/* Status: Idle - show summary and generate button */}
            {status === "idle" && (
              <div className="space-y-6">
                {/* Section summary */}
                <div className="grid gap-3">
                  {enabledSections.map((section) => {
                    const count = (uploads[section.section_key] || []).length;
                    return (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-card"
                      >
                        <span className="font-display font-medium text-foreground">{section.title}</span>
                        <span className={`text-sm font-display font-semibold ${count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {count > 0 ? `${count} photo${count > 1 ? "s" : ""}` : "No content"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    size="lg"
                    className="bg-gradient-gold shadow-gold-glow hover:opacity-90 text-accent-foreground font-display font-semibold h-14 px-10 text-lg"
                    onClick={handleGenerate}
                  >
                    <Sparkles className="w-6 h-6 mr-2" />
                    Generate Yearbook
                  </Button>
                </div>
              </div>
            )}

            {/* Status: Collecting / Generating */}
            {(status === "collecting" || status === "generating") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-16"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-primary-glow mx-auto">
                  <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {status === "collecting" ? "Collecting your content..." : "Generating yearbook pages..."}
                  </h2>
                  <p className="text-muted-foreground mt-1">This may take a moment</p>
                </div>
                <div className="max-w-md mx-auto">
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
                </div>
              </motion.div>
            )}

            {/* Status: Error */}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6 py-16"
              >
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <h2 className="text-xl font-display font-bold text-foreground">Generation Failed</h2>
                <p className="text-muted-foreground">{errorMsg}</p>
                <Button onClick={() => setStatus("idle")} variant="outline" className="font-display">
                  Try Again
                </Button>
              </motion.div>
            )}

            {/* Status: Done - Flipbook Preview */}
            {status === "done" && pages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Your Yearbook is Ready! 🎉
                  </h2>
                </div>

                {/* Flipbook preview */}
                <div className="relative bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
                  <div className="bg-gradient-hero p-4 flex items-center justify-between">
                    <h3 className="font-display font-semibold text-primary-foreground text-sm">
                      {pages[currentPage]?.title}
                    </h3>
                    <span className="text-xs text-primary-foreground/70 font-display">
                      Page {currentPage + 1} of {pages.length}
                    </span>
                  </div>

                  <div className="p-6 min-h-[400px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        {pages[currentPage]?.images.map((img) => (
                          <div key={img.id} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                            <img
                              src={img.public_url}
                              alt={img.file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between p-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="font-display"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex gap-1.5">
                      {pages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            i === currentPage ? "bg-primary" : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
                      disabled={currentPage === pages.length - 1}
                      className="font-display"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Download actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-display h-12 px-8 border-primary/30 text-primary"
                    onClick={() => {
                      setCurrentPage(0);
                      toast({ title: "Flipbook mode", description: "Use the arrows to browse your yearbook!" });
                    }}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    View Flipbook
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default GeneratePage;
