import { useState, useEffect } from "react";
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
  Star,
  Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
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
  caption: string;
  category: string;
  created_at: string;
}

type GenerationStatus = "idle" | "collecting" | "generating" | "done" | "error";

const TEMPLATES = [
  { id: "modern-magazine", name: "Modern Magazine", accent: "hsl(235, 65%, 45%)", bg: "linear-gradient(135deg, #3730a3, #1e1b4b)" },
  { id: "sparkly-memories", name: "Sparkly Memories", accent: "hsl(38, 92%, 50%)", bg: "linear-gradient(135deg, #d97706, #f59e0b)" },
  { id: "elegant-classic", name: "Elegant Classic", accent: "hsl(0, 0%, 15%)", bg: "linear-gradient(135deg, #1f2937, #111827)" },
  { id: "vibrant-pop", name: "Vibrant Pop", accent: "hsl(280, 70%, 50%)", bg: "linear-gradient(135deg, #7c3aed, #ec4899)" },
];

const GeneratePage = () => {
  const { user } = useAuth();
  const { project, sections, loading: projectLoading } = useProject();
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<Record<string, UploadItem[]>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("modern-magazine");

  const enabledSections = sections.filter((s) => s.enabled);

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
          grouped[u.category].push({ ...u, caption: u.caption || "" });
        });
        setUploads(grouped);
      }
    };
    load();
  }, [user]);

  const handleGenerate = async () => {
    const hasContent = enabledSections.some(
      (s) => (uploads[s.section_key] || []).length > 0 || (s.content as any)?.richText
    );
    if (!hasContent) {
      toast({ title: "No content uploaded", description: "Please upload photos/content to at least one section before generating.", variant: "destructive" });
      return;
    }
    setStatus("collecting");
    setProgress(0);
    setErrorMsg("");
    try {
      for (let i = 0; i <= 40; i += 5) { await new Promise((r) => setTimeout(r, 120)); setProgress(i); }
      setStatus("generating");
      for (let i = 40; i <= 100; i += 3) { await new Promise((r) => setTimeout(r, 150)); setProgress(i); }
      setStatus("done");
      setCurrentPage(0);
      toast({ title: "Yearbook generated! 🎉", description: "Your yearbook is ready to preview and download." });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Generation failed.");
      toast({ title: "Generation failed", description: err?.message || "Something went wrong.", variant: "destructive" });
    }
  };

  const buildPages = () => {
    const pages: { title: string; type: "gallery" | "message" | "qr"; images: UploadItem[]; content?: Record<string, any> }[] = [];
    enabledSections.forEach((section) => {
      const sectionUploads = uploads[section.section_key] || [];
      const sectionContent = section.content as Record<string, any> || {};
      if (section.section_key === "principal") {
        pages.push({ title: section.title, type: "message", images: sectionUploads, content: sectionContent });
      } else if (section.section_key === "qr") {
        pages.push({ title: section.title, type: "qr", images: [], content: sectionContent });
      } else if (sectionUploads.length > 0) {
        pages.push({ title: section.title, type: "gallery", images: sectionUploads, content: sectionContent });
      }
    });
    return pages;
  };

  const pages = buildPages();
  const template = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
  const flipbookUrl = typeof window !== "undefined" ? `${window.location.origin}/generate` : "";

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Pop-up blocked", description: "Please allow pop-ups to download PDF.", variant: "destructive" });
      return;
    }

    const pagesHtml = pages.map((page) => {
      if (page.type === "message") {
        return `
          <div style="page-break-after:always;padding:60px;font-family:'Space Grotesk',sans-serif;">
            <div style="text-align:center;margin-bottom:32px;">
              <h2 style="font-size:32px;color:${template.accent};border-bottom:3px solid ${template.accent};display:inline-block;padding-bottom:8px;">${page.title}</h2>
            </div>
            ${page.images[0] ? `<div style="text-align:center;margin-bottom:24px;"><img src="${page.images[0].public_url}" style="width:180px;height:180px;border-radius:50%;object-fit:cover;border:4px solid ${template.accent};box-shadow:0 8px 32px rgba(0,0,0,0.15);" /></div>` : ""}
            <div style="font-size:16px;line-height:1.8;color:#333;max-width:600px;margin:0 auto;font-style:italic;padding:24px;background:#f8f8fc;border-radius:16px;border-left:4px solid ${template.accent};">
              ${page.content?.richText || "No message added yet."}
            </div>
          </div>`;
      }
      if (page.type === "qr") {
        return `
          <div style="page-break-after:always;padding:60px;text-align:center;font-family:'Space Grotesk',sans-serif;">
            <h2 style="font-size:32px;color:${template.accent};margin-bottom:24px;">${page.title}</h2>
            <p style="color:#666;margin-bottom:32px;">Scan to view the interactive flip-book version</p>
            <div style="display:inline-block;padding:24px;background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.1);">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(page.content?.anthemUrl || flipbookUrl)}" style="width:200px;height:200px;" />
            </div>
            ${page.content?.anthemUrl ? `<p style="margin-top:16px;color:#888;font-size:14px;">🎵 College Anthem: ${page.content.anthemUrl}</p>` : ""}
          </div>`;
      }
      // Gallery
      return `
        <div style="page-break-after:always;padding:40px 60px;font-family:'Space Grotesk',sans-serif;">
          <div style="text-align:center;margin-bottom:32px;position:relative;">
            <div style="display:inline-block;position:relative;">
              <h2 style="font-size:32px;color:${template.accent};margin:0;">${page.title}</h2>
              <div style="height:3px;background:${template.accent};margin-top:8px;border-radius:4px;"></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;">
            ${page.images.map((img) => `
              <div style="break-inside:avoid;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);background:white;">
                <img src="${img.public_url}" style="width:100%;aspect-ratio:4/3;object-fit:cover;" />
                ${img.caption ? `<div style="padding:12px 16px;font-size:13px;color:#555;border-top:1px solid #eee;line-height:1.5;">${img.caption}</div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>`;
    }).join("");

    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${project?.name || "Memorie Yearbook"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
        body{margin:0;} @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
      </style></head><body>
        <div style="text-align:center;padding:100px 40px;page-break-after:always;background:${template.bg};min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-size:14px;letter-spacing:6px;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-bottom:24px;font-family:'Space Grotesk',sans-serif;">Class of 2026</div>
          <h1 style="font-family:'Space Grotesk',sans-serif;font-size:56px;color:white;margin:0 0 16px;text-shadow:0 4px 20px rgba(0,0,0,0.3);">${project?.name || "Memorie Yearbook"}</h1>
          <div style="width:80px;height:3px;background:rgba(255,255,255,0.4);border-radius:4px;margin:16px auto;"></div>
          <p style="font-family:'Space Grotesk',sans-serif;font-size:16px;color:rgba(255,255,255,0.7);">Created with ✨ Memorie</p>
        </div>
        ${pagesHtml}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center pt-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/sections" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Sections
            </Link>

            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Generate Your Yearbook</h1>
              <p className="text-muted-foreground mt-1">{project?.name} • {enabledSections.length} sections ready</p>
            </div>

            {/* Idle: Template picker + summary */}
            {status === "idle" && (
              <div className="space-y-8">
                {/* Template Selection */}
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" /> Choose Template
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTemplate === tmpl.id
                            ? "border-primary shadow-primary-glow bg-primary/5"
                            : "border-border hover:border-primary/30 bg-card"
                        }`}
                      >
                        <div className="w-full h-12 rounded-lg mb-3" style={{ background: tmpl.bg }} />
                        <p className="font-display font-medium text-sm text-foreground">{tmpl.name}</p>
                        {selectedTemplate === tmpl.id && (
                          <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section summary */}
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-4">Section Summary</h3>
                  <div className="grid gap-3">
                    {enabledSections.map((section) => {
                      const count = (uploads[section.section_key] || []).length;
                      const hasText = (section.content as any)?.richText;
                      return (
                        <div key={section.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-card">
                          <span className="font-display font-medium text-foreground">{section.title}</span>
                          <div className="flex items-center gap-2">
                            {hasText && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-display">Text</span>}
                            <span className={`text-sm font-display font-semibold ${count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                              {section.section_key === "qr" ? "Auto" : count > 0 ? `${count} photo${count > 1 ? "s" : ""}` : "Empty"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Button size="lg" className="bg-gradient-gold shadow-gold-glow hover:opacity-90 text-accent-foreground font-display font-semibold h-14 px-10 text-lg" onClick={handleGenerate}>
                    <Sparkles className="w-6 h-6 mr-2" /> Generate Yearbook
                  </Button>
                </div>
              </div>
            )}

            {/* Collecting / Generating */}
            {(status === "collecting" || status === "generating") && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-16">
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

            {/* Error */}
            {status === "error" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 py-16">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <h2 className="text-xl font-display font-bold text-foreground">Generation Failed</h2>
                <p className="text-muted-foreground">{errorMsg}</p>
                <Button onClick={() => setStatus("idle")} variant="outline" className="font-display">Try Again</Button>
              </motion.div>
            )}

            {/* Done: Modern Flipbook Preview */}
            {status === "done" && pages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-display font-bold text-foreground">Your Yearbook is Ready! 🎉</h2>
                  <p className="text-sm text-muted-foreground mt-1">Using "{template.name}" template</p>
                </div>

                {/* Flipbook */}
                <div className="relative bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
                  <div className="p-4 flex items-center justify-between" style={{ background: template.bg }}>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-white/60" />
                      <h3 className="font-display font-semibold text-white text-sm">{pages[currentPage]?.title}</h3>
                    </div>
                    <span className="text-xs text-white/60 font-display">Page {currentPage + 1} of {pages.length}</span>
                  </div>

                  <div className="p-6 min-h-[420px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, rotateY: 15 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -15 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Message type page */}
                        {pages[currentPage]?.type === "message" && (
                          <div className="max-w-lg mx-auto text-center space-y-6">
                            {pages[currentPage]?.images[0] && (
                              <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-primary/20 shadow-elevated">
                                <img src={pages[currentPage].images[0].public_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="p-6 rounded-2xl bg-muted/50 border border-border italic text-foreground leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: pages[currentPage]?.content?.richText || "No message added." }}
                            />
                          </div>
                        )}

                        {/* QR type page */}
                        {pages[currentPage]?.type === "qr" && (
                          <div className="flex flex-col items-center justify-center space-y-6 py-8">
                            <p className="text-muted-foreground font-display">Scan to view interactive flip-book</p>
                            <div className="p-6 bg-white rounded-2xl shadow-elevated">
                              <QRCodeSVG
                                value={pages[currentPage]?.content?.anthemUrl || flipbookUrl}
                                size={200}
                                level="H"
                                includeMargin
                              />
                            </div>
                            {pages[currentPage]?.content?.anthemUrl && (
                              <p className="text-sm text-muted-foreground">🎵 {pages[currentPage].content?.anthemUrl}</p>
                            )}
                          </div>
                        )}

                        {/* Gallery type page */}
                        {pages[currentPage]?.type === "gallery" && (
                          <div className="grid grid-cols-2 gap-4">
                            {pages[currentPage]?.images.map((img) => (
                              <div key={img.id} className="group rounded-xl overflow-hidden bg-muted shadow-card hover:shadow-elevated transition-shadow">
                                <div className="aspect-[4/3] overflow-hidden">
                                  <img src={img.public_url} alt={img.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                {img.caption && (
                                  <div className="p-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground leading-relaxed">{img.caption}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Nav */}
                  <div className="flex items-center justify-between p-4 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="font-display">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="flex gap-1.5">
                      {pages.map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentPage ? "bg-primary" : "bg-border"}`} />
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))} disabled={currentPage === pages.length - 1} className="font-display">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8" onClick={handleDownloadPDF}>
                    <Download className="w-5 h-5 mr-2" /> Download PDF
                  </Button>
                  <Button size="lg" variant="outline" className="font-display h-12 px-8 border-primary/30 text-primary" onClick={() => { setCurrentPage(0); toast({ title: "Flipbook mode", description: "Use the arrows to browse your yearbook!" }); }}>
                    <BookOpen className="w-5 h-5 mr-2" /> View Flipbook
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
