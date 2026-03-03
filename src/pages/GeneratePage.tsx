import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, BookOpen, Loader2, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, Sparkles, Star, Palette, Heart, Mail, QrCode,
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

/* ─── Section-specific taglines ─── */
const SECTION_TAGLINES: Record<string, string> = {
  "Principal's Message": "Words of wisdom to carry forward 🎓",
  "Academic Stars & Toppers": "Brilliance that lights the way ⭐",
  "Events Gallery": "Moments frozen in time 📸",
  "Fun Memes & Candid Moments": "Laughter is the best flashback 😂",
  "Farewell & Memories": "Goodbyes that echo forever 💫",
  "QR Code - College Anthem": "Scan, listen, relive 🎵",
};

const getSectionTagline = (title: string): string => {
  return SECTION_TAGLINES[title] || "Memories that make the heart smile 💕";
};

const TEMPLATES = [
  {
    id: "modern-magazine", name: "Modern Magazine",
    accent: "hsl(235, 65%, 45%)", bg: "linear-gradient(135deg, #3730a3, #1e1b4b)",
    coverBg: "linear-gradient(160deg, #c7d2fe, #a5b4fc88, #e0e7ff)",
    titleColor: "#1e1b4b", subtitleColor: "#6366f1", frameColor: "#6366f1",
    taglineEmoji: "📘", pdfAccent: "#3730a3", pdfLight: "#e0e7ff",
  },
  {
    id: "sparkly-memories", name: "Sparkly Memories",
    accent: "hsl(38, 92%, 50%)", bg: "linear-gradient(135deg, #d97706, #f59e0b)",
    coverBg: "linear-gradient(160deg, #fef3c7, #fde68a88, #fffbeb)",
    titleColor: "#78350f", subtitleColor: "#d97706", frameColor: "#d97706",
    taglineEmoji: "✨", pdfAccent: "#d97706", pdfLight: "#fef3c7",
  },
  {
    id: "elegant-classic", name: "Elegant Classic",
    accent: "hsl(0, 0%, 15%)", bg: "linear-gradient(135deg, #1f2937, #111827)",
    coverBg: "linear-gradient(160deg, #f3f4f6, #d1d5db88, #e5e7eb)",
    titleColor: "#111827", subtitleColor: "#6b7280", frameColor: "#374151",
    taglineEmoji: "🖋️", pdfAccent: "#1f2937", pdfLight: "#f3f4f6",
  },
  {
    id: "vibrant-pop", name: "Vibrant Pop",
    accent: "hsl(280, 70%, 50%)", bg: "linear-gradient(135deg, #7c3aed, #ec4899)",
    coverBg: "linear-gradient(160deg, #fce7f3, #e9d5ff88, #fdf2f8)",
    titleColor: "#7c3aed", subtitleColor: "#ec4899", frameColor: "#a855f7",
    taglineEmoji: "🎨", pdfAccent: "#7c3aed", pdfLight: "#fce7f3",
  },
  {
    id: "retro", name: "Retro Nostalgia",
    accent: "hsl(30, 60%, 40%)", bg: "linear-gradient(135deg, #8b4513, #d4a056)",
    coverBg: "linear-gradient(160deg, #e8d5b7, #d4a05688, #f5e6d3)",
    titleColor: "#4a3728", subtitleColor: "#8b4513", frameColor: "#a0522d",
    taglineEmoji: "📷", pdfAccent: "#8b4513", pdfLight: "#e8d5b7",
  },
  {
    id: "neon", name: "Neon Nights",
    accent: "hsl(160, 100%, 50%)", bg: "linear-gradient(135deg, #0d0d1a, #00ff88)",
    coverBg: "linear-gradient(160deg, #1a1a2e, #16213e88, #0f3460)",
    titleColor: "#00ff88", subtitleColor: "#ff0088", frameColor: "#00ff88",
    taglineEmoji: "⚡", pdfAccent: "#00ff88", pdfLight: "#1a1a2e",
  },
];

/* ─── Floating decorative element ─── */
const FloatingDeco = ({ icon: Icon, delay, x, y, size = 3 }: { icon: any; delay: number; x: string; y: string; size?: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ top: y, left: x }}
    animate={{ y: [0, -10, 0], opacity: [0.25, 0.6, 0.25], scale: [0.85, 1.15, 0.85] }}
    transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <Icon className={`w-${size} h-${size} text-pastel-rose/50 fill-pastel-rose/25`} />
  </motion.div>
);

/* ─── Magazine Cover Page ─── */
const CoverPage = ({ projectName, batch, college, template, images }: { projectName: string; batch?: string; college?: string; template: any; images: UploadItem[] }) => {
  const coverPhotos = images.slice(0, 5);
  return (
    <div className="relative min-h-[520px] flex flex-col items-center justify-center overflow-hidden rounded-xl" style={{ background: "linear-gradient(160deg, hsl(var(--pastel-pink)), hsl(var(--pastel-lavender) / 0.6), hsl(var(--pastel-cream)))" }}>
      {/* Bokeh lights */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`bokeh-${i}`}
          className="absolute rounded-full"
          style={{
            width: 40 + i * 25,
            height: 40 + i * 25,
            top: `${10 + (i * 13) % 75}%`,
            left: `${5 + (i * 17) % 85}%`,
            background: `radial-gradient(circle, hsl(var(--pastel-gold-frame) / 0.15), transparent)`,
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}

      {/* Floating hearts & sparkles */}
      <FloatingDeco icon={Heart} delay={0} x="8%" y="15%" size={4} />
      <FloatingDeco icon={Sparkles} delay={0.5} x="85%" y="20%" size={3} />
      <FloatingDeco icon={Star} delay={1} x="12%" y="75%" size={3} />
      <FloatingDeco icon={Heart} delay={1.5} x="80%" y="70%" size={4} />
      <FloatingDeco icon={Sparkles} delay={0.8} x="50%" y="10%" size={3} />

      {/* Cover photo collage */}
      {coverPhotos.length > 0 && (
        <div className="relative w-72 h-48 mb-8 mt-4">
          {coverPhotos.map((img, i) => {
            const positions = [
              { x: 0, y: 0, rot: -6, w: 120, h: 140 },
              { x: 140, y: -10, rot: 4, w: 110, h: 130 },
              { x: 50, y: 80, rot: -2, w: 130, h: 100 },
              { x: -20, y: 60, rot: 5, w: 100, h: 120 },
              { x: 160, y: 70, rot: -3, w: 110, h: 110 },
            ];
            const p = positions[i];
            return (
              <motion.div
                key={img.id}
                className="absolute"
                style={{ left: p.x, top: p.y, width: p.w, height: p.h, zIndex: 5 - i }}
                initial={{ opacity: 0, scale: 0.7, rotate: p.rot }}
                animate={{ opacity: 1, scale: 1, rotate: p.rot }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: "easeOut" }}
              >
                <div className="w-full h-full rounded-2xl p-[2px] bg-gradient-to-br from-pastel-gold-frame/70 via-white to-pastel-pink/50 shadow-pastel-lg">
                  <img src={img.public_url} alt="" className="w-full h-full object-cover rounded-[14px]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Title */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <p className="font-display text-xs tracking-[0.35em] uppercase text-pastel-rose/70 mb-3">
          {batch ? `Class of ${batch}` : college || "Class of 2026"}
        </p>
        <h1 className="font-cursive text-4xl sm:text-5xl text-foreground drop-shadow-sm leading-tight mb-3">
          {projectName || "Our School Memories"}
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-px bg-pastel-gold-frame/50" />
          <Heart className="w-4 h-4 text-pastel-rose fill-pastel-rose/40" />
          <div className="w-12 h-px bg-pastel-gold-frame/50" />
        </div>
        <p className="font-serif italic text-sm text-muted-foreground">Cherish Every Moment 💕</p>
      </motion.div>
    </div>
  );
};

/* ─── Principal's Message Page ─── */
const PrincipalPage = ({ page }: { page: any }) => (
  <div className="relative min-h-[480px] p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8" style={{ background: "linear-gradient(145deg, hsl(var(--pastel-cream) / 0.5), hsl(var(--pastel-lavender) / 0.2))" }}>
    <FloatingDeco icon={Star} delay={0} x="90%" y="10%" />
    <FloatingDeco icon={Sparkles} delay={0.7} x="5%" y="85%" />

    {/* Photo in oval gold frame */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex-shrink-0"
    >
      <div className="w-40 h-48 sm:w-48 sm:h-56 rounded-[50%] p-[4px] bg-gradient-to-br from-pastel-gold-frame via-pastel-gold-frame/60 to-pastel-cream shadow-pastel-lg">
        {page.images[0] ? (
          <img src={page.images[0].public_url} alt="Principal" className="w-full h-full object-cover rounded-[50%]" />
        ) : (
          <div className="w-full h-full rounded-[50%] bg-pastel-cream flex items-center justify-center">
            <Mail className="w-10 h-10 text-pastel-gold-frame/60" />
          </div>
        )}
      </div>
    </motion.div>

    {/* Speech */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="flex-1 space-y-4"
    >
      <h2 className="font-cursive text-3xl text-pastel-rose">
        {page.title} 💖
      </h2>
      <div className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-pastel-gold-frame/20 shadow-pastel">
        <div className="absolute -top-3 left-6 text-4xl text-pastel-gold-frame/40 font-serif">"</div>
        <div
          className="font-serif text-lg sm:text-xl text-foreground/80 leading-relaxed italic"
          dangerouslySetInnerHTML={{ __html: page.content?.richText || "<p>Dear Students, Dream big and shine bright! Your journey is just beginning. 💖</p>" }}
        />
        <div className="absolute -bottom-3 right-6 text-4xl text-pastel-gold-frame/40 font-serif">"</div>
      </div>
      <div className="flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
            <Star className="w-3 h-3 text-pastel-gold-frame/50 fill-pastel-gold-frame/30" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

/* ─── Dreamy Gallery Page ─── */
const GalleryPage = ({ page }: { page: any }) => (
  <div className="relative min-h-[480px] p-4 sm:p-6" style={{ background: "linear-gradient(160deg, hsl(var(--pastel-pink) / 0.15), hsl(var(--pastel-lavender) / 0.1), hsl(var(--pastel-cream) / 0.3))" }}>
    {/* Floating elements */}
    {[...Array(5)].map((_, i) => (
      <FloatingDeco key={i} icon={i % 2 === 0 ? Heart : Sparkles} delay={i * 0.4} x={`${8 + i * 20}%`} y={`${10 + (i * 18) % 60}%`} />
    ))}

    {/* Section title */}
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
      <h2 className="font-cursive text-3xl sm:text-4xl text-pastel-rose drop-shadow-sm">{page.title}</h2>
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="w-10 h-px bg-pastel-gold-frame/40" />
        <span className="text-pastel-gold-frame text-xs">✨</span>
        <div className="w-10 h-px bg-pastel-gold-frame/40" />
      </div>
    </motion.div>

    {/* Asymmetrical collage with CSS grid */}
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "55px" }}>
      {page.images.map((img: UploadItem, idx: number) => {
        const layouts = [
          { col: "1 / 8", row: "span 5" },
          { col: "8 / 13", row: "span 4" },
          { col: "1 / 6", row: "span 4" },
          { col: "6 / 13", row: "span 5" },
          { col: "1 / 7", row: "span 5" },
          { col: "7 / 13", row: "span 4" },
          { col: "2 / 12", row: "span 4" },
          { col: "1 / 8", row: "span 5" },
        ];
        const layout = layouts[idx % layouts.length];
        const rotation = idx % 3 === 0 ? -1.8 : idx % 3 === 1 ? 1.2 : -0.5;

        return (
          <motion.div
            key={img.id}
            className="group relative"
            style={{ gridColumn: layout.col, gridRow: layout.row, zIndex: idx % 2 === 0 ? 2 : 1 }}
            initial={{ opacity: 0, scale: 0.85, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="relative h-full rounded-2xl p-[3px] bg-gradient-to-br from-pastel-gold-frame/60 via-white to-pastel-pink/40 shadow-pastel hover:shadow-pastel-lg transition-all duration-700 ease-out hover:-translate-y-2"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="relative h-full rounded-[14px] overflow-hidden bg-white p-1.5">
                <img
                  src={img.public_url}
                  alt={img.file_name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Hover overlay */}
                <div className="absolute inset-1.5 rounded-xl bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {/* Caption */}
            {img.caption && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12 + 0.3 }}
                className="absolute -bottom-9 left-1 right-1 text-center font-cursive text-lg sm:text-xl text-pastel-rose drop-shadow-sm leading-snug z-10"
              >
                {img.caption} 💕
              </motion.p>
            )}
          </motion.div>
        );
      })}
    </div>

    {/* Bottom overlay message */}
    {page.images.length > 0 && (
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="flex justify-center mt-14 pt-2"
      >
        <p className="font-cursive text-2xl sm:text-3xl text-pastel-rose/80 text-center leading-relaxed drop-shadow-md">
          {getSectionTagline(page.title)}
        </p>
      </motion.div>
    )}
  </div>
);

/* ─── QR Code Page ─── */
const QRPage = ({ page, flipbookUrl }: { page: any; flipbookUrl: string }) => (
  <div className="relative min-h-[480px] flex flex-col items-center justify-center p-8" style={{ background: "linear-gradient(160deg, hsl(var(--pastel-cream) / 0.5), hsl(var(--pastel-lavender) / 0.3))" }}>
    <FloatingDeco icon={Heart} delay={0} x="15%" y="20%" />
    <FloatingDeco icon={Sparkles} delay={0.8} x="80%" y="25%" />
    <FloatingDeco icon={Star} delay={1.2} x="10%" y="75%" />

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
      <h2 className="font-cursive text-3xl text-pastel-rose">{page.title}</h2>
      <p className="font-serif italic text-muted-foreground text-sm">Scan to Access Full Magazine Online 📱</p>

      <div className="inline-block p-6 rounded-3xl bg-white shadow-pastel-lg border border-pastel-gold-frame/20">
        <QRCodeSVG
          value={page.content?.anthemUrl || flipbookUrl}
          size={180}
          level="H"
          includeMargin
          fgColor="hsl(235, 30%, 12%)"
        />
      </div>

      {page.content?.anthemUrl && (
        <p className="text-sm text-muted-foreground font-serif">🎵 {page.content.anthemUrl}</p>
      )}

      <div className="pt-4">
        <p className="font-cursive text-xl text-pastel-gold-frame/70">Thanks for Reading! 💖</p>
        <div className="flex justify-center gap-2 mt-3">
          {[...Array(3)].map((_, i) => (
            <motion.span key={i} animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
              <Heart className="w-3.5 h-3.5 text-pastel-rose/50 fill-pastel-rose/30" />
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

/* ─── Back Cover ─── */
const BackCover = ({ projectName }: { projectName: string }) => (
  <div className="relative min-h-[520px] flex flex-col items-center justify-center overflow-hidden rounded-xl" style={{ background: "linear-gradient(180deg, hsl(var(--pastel-cream)), hsl(var(--pastel-pink) / 0.4), hsl(var(--pastel-lavender) / 0.3))" }}>
    {/* Soft bokeh */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 60 + i * 30,
          height: 60 + i * 30,
          top: `${20 + i * 15}%`,
          left: `${10 + i * 18}%`,
          background: `radial-gradient(circle, hsl(var(--pastel-gold-frame) / 0.12), transparent)`,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}

    <FloatingDeco icon={Heart} delay={0} x="10%" y="25%" size={4} />
    <FloatingDeco icon={Sparkles} delay={1} x="85%" y="30%" />

    {/* Golden frame border */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 text-center px-10 py-12 rounded-3xl border-2 border-pastel-gold-frame/30 bg-white/40 backdrop-blur-sm shadow-pastel-lg max-w-sm mx-auto"
    >
      <p className="font-display text-xs tracking-[0.3em] uppercase text-pastel-gold-frame/60 mb-6">Thank You</p>
      <h2 className="font-cursive text-4xl text-foreground leading-tight mb-4">
        Cherish the Moments 💖
      </h2>
      <div className="flex items-center justify-center gap-3 my-5">
        <div className="w-10 h-px bg-pastel-gold-frame/40" />
        <Star className="w-4 h-4 text-pastel-gold-frame/50 fill-pastel-gold-frame/25" />
        <div className="w-10 h-px bg-pastel-gold-frame/40" />
      </div>
      <p className="font-serif italic text-sm text-muted-foreground leading-relaxed">
        Memories that last forever, friendships that never fade.
      </p>
      <p className="font-display text-xs text-muted-foreground/60 mt-8 tracking-wider">
        Created with ✨ Memorie
      </p>
    </motion.div>
  </div>
);

/* ─── Main Component ─── */
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

  // Sync template from project DB
  useEffect(() => {
    if (project?.template) {
      const exists = TEMPLATES.find((t) => t.id === project.template);
      if (exists) setSelectedTemplate(project.template);
    }
  }, [project]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("uploads").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
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
      toast({ title: "No content uploaded", description: "Please upload photos/content to at least one section.", variant: "destructive" });
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

  // Build magazine pages: Cover + content pages + Back Cover
  const buildPages = () => {
    const allImages = Object.values(uploads).flat();
    const magazinePages: { title: string; type: "cover" | "gallery" | "message" | "qr" | "back-cover"; images: UploadItem[]; content?: Record<string, any> }[] = [];

    // Front cover
    magazinePages.push({ title: "Front Cover", type: "cover", images: allImages });

    // Content pages (skip QR — we add it at the end)
    let qrContent: Record<string, any> = {};
    enabledSections.forEach((section) => {
      const sectionUploads = uploads[section.section_key] || [];
      const sectionContent = (section.content as Record<string, any>) || {};
      if (section.section_key === "qr") {
        qrContent = sectionContent;
        return; // handled below
      }
      if (section.section_key === "principal") {
        magazinePages.push({ title: section.title, type: "message", images: sectionUploads, content: sectionContent });
      } else if (sectionUploads.length > 0) {
        magazinePages.push({ title: section.title, type: "gallery", images: sectionUploads, content: sectionContent });
      }
    });

    // QR code always before back cover
    magazinePages.push({ title: "QR Code - Scan & Access", type: "qr", images: [], content: qrContent });

    // Back cover
    magazinePages.push({ title: "Back Cover", type: "back-cover", images: [] });

    return magazinePages;
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
      if (page.type === "cover") {
        return `
          <div style="page-break-after:always;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(160deg,#fce4ec,#e8eaf6aa,#fff8e1);padding:60px;text-align:center;">
            <p style="font-family:'Space Grotesk',sans-serif;font-size:12px;letter-spacing:6px;text-transform:uppercase;color:#ad6b8d;margin-bottom:16px;">${(project as any)?.batch ? `Class of ${(project as any).batch}` : (project as any)?.college || "Class of 2026"}</p>
            <h1 style="font-family:'Dancing Script',cursive;font-size:52px;color:#333;margin:0 0 12px;">${project?.name || "Our School Memories"}</h1>
            <div style="width:60px;height:2px;background:#d4a574;margin:16px auto;border-radius:2px;"></div>
            <p style="font-family:'Playfair Display',serif;font-style:italic;font-size:16px;color:#999;">Cherish Every Moment 💕</p>
          </div>`;
      }
      if (page.type === "message") {
        return `
          <div style="page-break-after:always;padding:60px;font-family:'Space Grotesk',sans-serif;background:linear-gradient(145deg,#fff8e1aa,#e8eaf622);">
            <div style="display:flex;align-items:flex-start;gap:40px;flex-wrap:wrap;">
              ${page.images[0] ? `<div style="flex-shrink:0;"><img src="${page.images[0].public_url}" style="width:180px;height:220px;border-radius:50%;object-fit:cover;border:4px solid #d4a574;box-shadow:0 8px 32px rgba(206,147,216,0.25);" /></div>` : ""}
              <div style="flex:1;min-width:260px;">
                <h2 style="font-family:'Dancing Script',cursive;font-size:34px;color:#ad6b8d;margin:0 0 20px;">💖 ${page.title}</h2>
                <div style="font-family:'Playfair Display',serif;font-size:18px;line-height:1.9;color:#444;font-style:italic;padding:24px;background:rgba(255,255,255,0.7);border-radius:16px;border-left:4px solid #d4a574;">
                  ${page.content?.richText || "Dear Students, Dream big and shine bright!"}
                </div>
              </div>
            </div>
          </div>`;
      }
      if (page.type === "qr") {
        return `
          <div style="page-break-after:always;padding:60px;text-align:center;background:linear-gradient(160deg,#fff8e1aa,#e8eaf633);">
            <h2 style="font-family:'Dancing Script',cursive;font-size:34px;color:#ad6b8d;margin-bottom:12px;">${page.title}</h2>
            <p style="font-family:'Playfair Display',serif;font-style:italic;color:#888;margin-bottom:32px;">Scan to Access Full Magazine Online 📱</p>
            <div style="display:inline-block;padding:24px;background:white;border-radius:24px;box-shadow:0 12px 40px rgba(206,147,216,0.2);border:2px solid #d4a57433;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(page.content?.anthemUrl || flipbookUrl)}" style="width:200px;height:200px;" />
            </div>
            <p style="font-family:'Dancing Script',cursive;font-size:22px;color:#d4a574;margin-top:32px;">Thanks for Reading! 💖</p>
          </div>`;
      }
      if (page.type === "back-cover") {
        return `
          <div style="page-break-after:always;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#fff8e1,#fce4ecaa,#e8eaf6aa);padding:60px;text-align:center;">
            <div style="border:2px solid #d4a57444;border-radius:24px;padding:48px 40px;background:rgba(255,255,255,0.4);backdrop-filter:blur(8px);max-width:380px;">
              <p style="font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:5px;text-transform:uppercase;color:#d4a574aa;margin-bottom:24px;">Thank You</p>
              <h2 style="font-family:'Dancing Script',cursive;font-size:40px;color:#333;margin:0 0 16px;">Cherish the Moments 💖</h2>
              <div style="width:40px;height:1px;background:#d4a574;margin:20px auto;"></div>
              <p style="font-family:'Playfair Display',serif;font-style:italic;font-size:14px;color:#888;line-height:1.8;">Memories that last forever, friendships that never fade.</p>
              <p style="font-family:'Space Grotesk',sans-serif;font-size:11px;color:#bbb;margin-top:32px;">Created with ✨ Memorie</p>
            </div>
          </div>`;
      }
      // Gallery
      return `
        <div style="page-break-after:always;padding:40px 50px;background:linear-gradient(160deg,#fce4ec22,#e8eaf622,#fff8e122);">
          <div style="text-align:center;margin-bottom:28px;">
            <h2 style="font-family:'Dancing Script',cursive;font-size:38px;color:#ad6b8d;">${page.title}</h2>
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;">
              <div style="width:40px;height:1px;background:#d4a574;opacity:0.4;"></div>
              <span style="color:#d4a574;font-size:12px;">✨</span>
              <div style="width:40px;height:1px;background:#d4a574;opacity:0.4;"></div>
            </div>
          </div>
          <div style="column-count:2;column-gap:24px;">
            ${page.images.map((img: UploadItem, idx: number) => `
              <div style="break-inside:avoid;margin-bottom:24px;background:white;border-radius:18px;padding:5px;box-shadow:0 6px 28px rgba(206,147,216,0.18);border:1.5px solid rgba(212,165,116,0.15);transform:rotate(${idx % 3 === 0 ? '-1.5' : idx % 3 === 1 ? '1' : '0'}deg);">
                <img src="${img.public_url}" style="width:100%;border-radius:14px;object-fit:cover;aspect-ratio:${idx % 3 === 0 ? '3/4' : '4/3'};" />
                ${img.caption ? `<div style="padding:12px 8px 8px;text-align:center;font-family:'Dancing Script',cursive;font-size:19px;color:#ad6b8d;line-height:1.5;">${img.caption} 💕</div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>`;
    }).join("");

    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${project?.name || "Memorie Yearbook"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@400;500;600;700&display=swap');
        body{margin:0;} @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
      </style></head><body>${pagesHtml}</body></html>
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
              <h1 className="font-cursive text-3xl sm:text-4xl text-foreground">Generate Your Yearbook</h1>
              <p className="text-muted-foreground mt-1 font-serif italic text-sm">{project?.name} • {enabledSections.length} sections ready</p>
            </div>

            {/* Idle */}
            {status === "idle" && (
              <div className="space-y-8">
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
                        {selectedTemplate === tmpl.id && <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

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

            {/* Loading */}
            {(status === "collecting" || status === "generating") && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pastel-pink to-pastel-lavender flex items-center justify-center shadow-pastel-lg mx-auto">
                  <Loader2 className="w-10 h-10 text-foreground animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-cursive text-foreground">
                    {status === "collecting" ? "Collecting your memories..." : "Crafting your magazine..."}
                  </h2>
                  <p className="text-muted-foreground mt-1 font-serif italic text-sm">This may take a moment ✨</p>
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

            {/* Done — Magazine Flipbook */}
            {status === "done" && pages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-cursive text-foreground">Your Magazine is Ready! 🎉</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-serif italic">Using "{template.name}" template</p>
                </div>

                {/* Flipbook viewer */}
                <div className="relative bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
                  {/* Header bar */}
                  <div className="p-4 flex items-center justify-between bg-gradient-to-r from-pastel-pink/30 via-pastel-lavender/20 to-pastel-cream/30 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pastel-rose/60 fill-pastel-rose/30" />
                      <h3 className="font-cursive text-lg text-foreground">{pages[currentPage]?.title}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground font-display">Page {currentPage + 1} of {pages.length}</span>
                  </div>

                  {/* Page content */}
                  <div className="min-h-[520px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, rotateY: 12 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -12 }}
                        transition={{ duration: 0.45 }}
                      >
                        {pages[currentPage]?.type === "cover" && (
                          <CoverPage projectName={project?.name || ""} batch={(project as any)?.batch} college={(project as any)?.college} template={template} images={pages[currentPage].images} />
                        )}
                        {pages[currentPage]?.type === "message" && <PrincipalPage page={pages[currentPage]} />}
                        {pages[currentPage]?.type === "gallery" && <GalleryPage page={pages[currentPage]} />}
                        {pages[currentPage]?.type === "qr" && <QRPage page={pages[currentPage]} flipbookUrl={flipbookUrl} />}
                        {pages[currentPage]?.type === "back-cover" && <BackCover projectName={project?.name || ""} />}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between p-4 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="font-display">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="flex gap-1.5">
                      {pages.map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentPage ? "bg-pastel-rose" : "bg-border"}`} />
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
                  <Button size="lg" variant="outline" className="font-display h-12 px-8 border-primary/30 text-primary" onClick={() => { setCurrentPage(0); toast({ title: "Flipbook mode", description: "Browse your magazine!" }); }}>
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
