import { useState, useCallback, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SECTION_META: Record<string, { title: string; description: string }> = {
  principal: { title: "Principal's Message", description: "Add the principal's photo and message" },
  toppers: { title: "Academic Stars & Toppers", description: "Upload topper photos and achievements" },
  events: { title: "Events Gallery", description: "Upload event photos with captions" },
  memes: { title: "Fun Memes & Candid Moments", description: "Add fun photos and memes" },
  farewell: { title: "Farewell & Memories", description: "Upload farewell photos and quotes" },
  qr: { title: "QR Code - College Anthem", description: "Add QR codes linking to multimedia" },
};

interface SectionFile {
  id: string;
  name: string;
  size: string;
  status: "uploading" | "done" | "error";
  progress: number;
  publicUrl?: string;
  caption: string;
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
  const navigate = useNavigate();
  const [files, setFiles] = useState<SectionFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const meta = SECTION_META[sectionId || ""] || {
    title: "Custom Section",
    description: "Upload content for this section",
  };

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setFiles((p) => p.map((f) => (f.id === id ? { ...f, status: "error" as const, errorMessage: "Please log in" } : f)));
          return;
        }

        const progressInterval = setInterval(() => {
          setFiles((p) => p.map((f) => (f.id === id && f.status === "uploading" ? { ...f, progress: Math.min(f.progress + 15, 85) } : f)));
        }, 200);

        const ext = file.name.split(".").pop();
        const storagePath = `${user.id}/${sectionId}/${id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("yearbook-uploads")
          .upload(storagePath, file, { contentType: file.type, upsert: false });

        clearInterval(progressInterval);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("yearbook-uploads").getPublicUrl(storagePath);

        await supabase.from("uploads").insert({
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          category: sectionId || "general",
          storage_path: storagePath,
          public_url: publicUrl,
        });

        setFiles((p) => p.map((f) => (f.id === id ? { ...f, status: "done" as const, progress: 100, publicUrl } : f)));
      } catch (err: any) {
        setFiles((p) => p.map((f) => (f.id === id ? { ...f, status: "error" as const, progress: 0, errorMessage: err?.message || "Upload failed" } : f)));
      }
    },
    [sectionId]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach((f) => uploadFile(f));
    },
    [uploadFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const updateCaption = (id: string, caption: string) => {
    setFiles((p) => p.map((f) => (f.id === id ? { ...f, caption } : f)));
  };

  const removeFile = (id: string) => {
    setFiles((p) => p.filter((f) => f.id !== id));
  };

  const doneCount = files.filter((f) => f.status === "done").length;

  const handleSave = () => {
    toast({ title: "Section saved", description: `${doneCount} item(s) saved to "${meta.title}"` });
    navigate("/sections");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/sections"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sections
            </Link>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                {meta.title}
              </h1>
              <p className="text-muted-foreground mt-1">{meta.description}</p>
            </div>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 text-center ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-primary-glow mb-4">
                  <UploadIcon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  Drag & drop photos here
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  JPG, PNG, WebP — max 10 MB each
                </p>
                <Button
                  variant="outline"
                  className="font-display border-primary/30 text-primary hover:bg-primary/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Uploaded files with captions */}
            {files.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="font-display font-semibold text-foreground">
                  Uploads ({doneCount} ready)
                </h3>
                <AnimatePresence>
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 p-4 rounded-xl bg-card border border-border shadow-card"
                    >
                      {/* Preview */}
                      <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {file.status === "done" && file.publicUrl ? (
                          <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate flex-1">
                            {file.name}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">{file.size}</span>

                          {file.status === "uploading" && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
                          {file.status === "done" && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                          {file.status === "error" && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}

                          <button onClick={() => removeFile(file.id)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {file.status === "uploading" && <Progress value={file.progress} className="h-1.5" />}
                        {file.status === "error" && <p className="text-xs text-destructive">{file.errorMessage}</p>}

                        {file.status === "done" && (
                          <Input
                            placeholder="Add a caption…"
                            value={file.caption}
                            onChange={(e) => updateCaption(file.id, e.target.value)}
                            className="text-sm h-8"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Save */}
            <div className="flex justify-end mt-10">
              <Button
                size="lg"
                className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8"
                onClick={handleSave}
                disabled={doneCount === 0}
              >
                <Save className="w-5 h-5 mr-2" />
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
