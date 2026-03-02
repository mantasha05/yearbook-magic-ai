import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload as UploadIcon,
  Image,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Save,
  Bold,
  Italic,
  List,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useProject } from "@/hooks/use-project";

const SECTION_META: Record<string, { title: string; description: string; type: "gallery" | "message" | "qr" }> = {
  principal: { title: "Principal's Message", description: "Write the principal's message with formatting", type: "message" },
  toppers: { title: "Academic Stars & Toppers", description: "Upload topper photos and achievements", type: "gallery" },
  events: { title: "Events Gallery", description: "Upload event photos with captions and descriptions", type: "gallery" },
  memes: { title: "Fun Memes & Candid Moments", description: "Add fun photos and memes", type: "gallery" },
  farewell: { title: "Farewell & Memories", description: "Upload farewell photos and heartfelt quotes", type: "gallery" },
  qr: { title: "QR Code - College Anthem", description: "Auto-generated QR code for your yearbook flip-book", type: "qr" },
};

interface UploadedFile {
  id: string;
  file_name: string;
  public_url: string;
  caption: string;
  category: string;
}

interface LocalFile {
  id: string;
  name: string;
  size: string;
  status: "uploading" | "done" | "error";
  progress: number;
  publicUrl?: string;
  caption: string;
  dbId?: string;
  errorMessage?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const SectionEditor = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { user } = useAuth();
  const { project, sections, saveSections } = useProject();
  const navigate = useNavigate();
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [existingUploads, setExistingUploads] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [richText, setRichText] = useState("");
  const [anthemUrl, setAnthemUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const captionTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const meta = SECTION_META[sectionId || ""] || {
    title: "Custom Section",
    description: "Upload content for this section",
    type: "gallery" as const,
  };

  const currentSection = sections.find((s) => s.section_key === sectionId);

  // Load existing uploads and section content
  useEffect(() => {
    if (!user || !sectionId) return;
    const load = async () => {
      setLoadingExisting(true);
      const { data } = await supabase
        .from("uploads")
        .select("id, file_name, public_url, caption, category")
        .eq("user_id", user.id)
        .eq("category", sectionId)
        .order("created_at", { ascending: true });
      if (data) setExistingUploads(data.map((u: any) => ({ ...u, caption: u.caption || "" })));

      // Load rich text content from section
      if (currentSection?.content) {
        const content = currentSection.content as Record<string, any>;
        if (content.richText) setRichText(content.richText);
        if (content.anthemUrl) setAnthemUrl(content.anthemUrl);
      }
      setLoadingExisting(false);
    };
    load();
  }, [user, sectionId, currentSection?.id]);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = crypto.randomUUID();
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFiles((p) => [{ id, name: file.name, size: formatSize(file.size), status: "error", progress: 0, caption: "", errorMessage: "Only JPG, PNG, WebP allowed" }, ...p]);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFiles((p) => [{ id, name: file.name, size: formatSize(file.size), status: "error", progress: 0, caption: "", errorMessage: "File exceeds 10 MB" }, ...p]);
        return;
      }
      setFiles((p) => [{ id, name: file.name, size: formatSize(file.size), status: "uploading", progress: 0, caption: "" }, ...p]);
      try {
        if (!user) throw new Error("Not logged in");
        const progressInterval = setInterval(() => {
          setFiles((p) => p.map((f) => (f.id === id && f.status === "uploading" ? { ...f, progress: Math.min(f.progress + 15, 85) } : f)));
        }, 200);
        const ext = file.name.split(".").pop();
        const storagePath = `${user.id}/${sectionId}/${id}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("yearbook-uploads").upload(storagePath, file, { contentType: file.type, upsert: false });
        clearInterval(progressInterval);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("yearbook-uploads").getPublicUrl(storagePath);
        const { data: insertData } = await supabase.from("uploads").insert({
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          category: sectionId || "general",
          storage_path: storagePath,
          public_url: publicUrl,
          project_id: project?.id || null,
          caption: "",
        }).select("id").single();
        setFiles((p) => p.map((f) => (f.id === id ? { ...f, status: "done" as const, progress: 100, publicUrl, dbId: insertData?.id } : f)));
      } catch (err: any) {
        setFiles((p) => p.map((f) => (f.id === id ? { ...f, status: "error" as const, progress: 0, errorMessage: err?.message || "Upload failed" } : f)));
      }
    },
    [sectionId, user, project]
  );

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => uploadFile(f));
  }, [uploadFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Auto-save caption to DB with debounce
  const updateExistingCaption = (uploadId: string, caption: string) => {
    setExistingUploads((p) => p.map((u) => (u.id === uploadId ? { ...u, caption } : u)));
    if (captionTimeouts.current[uploadId]) clearTimeout(captionTimeouts.current[uploadId]);
    captionTimeouts.current[uploadId] = setTimeout(async () => {
      await supabase.from("uploads").update({ caption }).eq("id", uploadId);
    }, 800);
  };

  const updateNewFileCaption = (id: string, caption: string) => {
    setFiles((p) => p.map((f) => (f.id === id ? { ...f, caption } : f)));
    const file = files.find((f) => f.id === id);
    if (file?.dbId) {
      if (captionTimeouts.current[id]) clearTimeout(captionTimeouts.current[id]);
      captionTimeouts.current[id] = setTimeout(async () => {
        await supabase.from("uploads").update({ caption }).eq("id", file.dbId!);
      }, 800);
    }
  };

  const removeExistingUpload = async (uploadId: string) => {
    await supabase.from("uploads").delete().eq("id", uploadId);
    setExistingUploads((p) => p.filter((u) => u.id !== uploadId));
  };

  const removeNewFile = (id: string) => {
    setFiles((p) => p.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    // Save rich text / anthem URL to section content
    if (currentSection && (meta.type === "message" || meta.type === "qr")) {
      const updatedSections = sections.map((s) =>
        s.section_key === sectionId
          ? { ...s, content: { ...s.content, richText, anthemUrl } }
          : s
      );
      await saveSections(updatedSections);
    }
    setSaving(false);
    toast({ title: "Section saved ✓", description: `"${meta.title}" has been saved.` });
    navigate("/sections");
  };

  const allDone = files.filter((f) => f.status === "done");

  if (loadingExisting) {
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
      <input ref={inputRef} type="file" multiple accept={ACCEPTED_TYPES.join(",")} className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/sections" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Sections
            </Link>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{meta.title}</h1>
              <p className="text-muted-foreground mt-1">{meta.description}</p>
            </div>

            {/* Rich Text Editor for Principal's Message */}
            {meta.type === "message" && (
              <div className="mb-8 space-y-3">
                <label className="font-display font-semibold text-foreground text-sm">Message Content</label>
                <div className="flex gap-1 mb-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRichText(r => r + "<b></b>")} title="Bold">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRichText(r => r + "<i></i>")} title="Italic">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRichText(r => r + "\n• ")} title="List">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={richText}
                  onChange={(e) => setRichText(e.target.value)}
                  placeholder="Type the principal's message here... Use formatting buttons above or write plain text."
                  className="min-h-[200px] font-body text-sm"
                />
                <p className="text-xs text-muted-foreground">Supports basic HTML: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, bullet points</p>
              </div>
            )}

            {/* QR Code section */}
            {meta.type === "qr" && (
              <div className="mb-8 space-y-4">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
                  <h3 className="font-display font-semibold text-foreground mb-2">🎵 College Anthem / Custom Link</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The QR code will automatically link to your yearbook's interactive flip-book. Optionally add a college anthem URL below.
                  </p>
                  <Input
                    value={anthemUrl}
                    onChange={(e) => setAnthemUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... (optional)"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Leave empty to auto-link to your generated flip-book</p>
                </div>
              </div>
            )}

            {/* Upload zone for gallery types AND message (for photo) */}
            {(meta.type === "gallery" || meta.type === "message") && (
              <>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 text-center ${
                    dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-primary-glow mb-4">
                      <UploadIcon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                      Drag & drop photos here
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">JPG, PNG, WebP — max 10 MB each</p>
                    <Button variant="outline" className="font-display border-primary/30 text-primary hover:bg-primary/5" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                      <Plus className="w-4 h-4 mr-2" /> Browse Files
                    </Button>
                  </div>
                </div>

                {/* Existing uploads from DB */}
                {existingUploads.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="font-display font-semibold text-foreground">
                      Saved Photos ({existingUploads.length})
                    </h3>
                    {existingUploads.map((upload) => (
                      <div key={upload.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border shadow-card">
                        <div className="w-20 h-20 rounded-lg bg-secondary shrink-0 overflow-hidden">
                          <img src={upload.public_url} alt={upload.file_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate flex-1">{upload.file_name}</p>
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <button onClick={() => removeExistingUpload(upload.id)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <Textarea
                            placeholder="Add a caption or description…"
                            value={upload.caption}
                            onChange={(e) => updateExistingCaption(upload.id, e.target.value)}
                            className="text-sm min-h-[60px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Newly uploaded files */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-display font-semibold text-foreground">
                      New Uploads ({allDone.length} ready)
                    </h3>
                    <AnimatePresence>
                      {files.map((file) => (
                        <motion.div key={file.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 p-4 rounded-xl bg-card border border-border shadow-card">
                          <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                            {file.status === "done" && file.publicUrl ? (
                              <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <Image className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate flex-1">{file.name}</p>
                              <span className="text-xs text-muted-foreground shrink-0">{file.size}</span>
                              {file.status === "uploading" && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
                              {file.status === "done" && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                              {file.status === "error" && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
                              <button onClick={() => removeNewFile(file.id)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {file.status === "uploading" && <Progress value={file.progress} className="h-1.5" />}
                            {file.status === "error" && <p className="text-xs text-destructive">{file.errorMessage}</p>}
                            {file.status === "done" && (
                              <Textarea
                                placeholder="Add a caption or description…"
                                value={file.caption}
                                onChange={(e) => updateNewFileCaption(file.id, e.target.value)}
                                className="text-sm min-h-[60px]"
                              />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}

            {/* Save */}
            <div className="flex justify-end mt-10">
              <Button
                size="lg"
                className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                Save Section
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SectionEditor;
