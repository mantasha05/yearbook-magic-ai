import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Upload as UploadIcon,
  Image,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: "photo" | "document";
  status: "uploading" | "done" | "error";
  progress: number;
  publicUrl?: string;
  errorMessage?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ALL_ACCEPTED = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function fileCategory(mime: string): "photo" | "document" {
  return ACCEPTED_IMAGE_TYPES.includes(mime) ? "photo" : "document";
}

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
    const category = fileCategory(file.type);

    // Validate
    if (!ALL_ACCEPTED.includes(file.type)) {
      setFiles((prev) => [
        {
          id,
          name: file.name,
          size: formatSize(file.size),
          type: category,
          status: "error",
          progress: 0,
          errorMessage: "Unsupported file type",
        },
        ...prev,
      ]);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFiles((prev) => [
        {
          id,
          name: file.name,
          size: formatSize(file.size),
          type: category,
          status: "error",
          progress: 0,
          errorMessage: "File exceeds 10 MB limit",
        },
        ...prev,
      ]);
      return;
    }

    // Add as uploading
    setFiles((prev) => [
      {
        id,
        name: file.name,
        size: formatSize(file.size),
        type: category,
        status: "uploading",
        progress: 0,
      },
      ...prev,
    ]);

    try {
      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, status: "error" as const, errorMessage: "Please log in to upload files" }
              : f
          )
        );
        return;
      }

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id && f.status === "uploading"
              ? { ...f, progress: Math.min(f.progress + 15, 85) }
              : f
          )
        );
      }, 200);

      const ext = file.name.split(".").pop();
      const storagePath = `${user.id}/${category}/${id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("yearbook-uploads")
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("yearbook-uploads").getPublicUrl(storagePath);

      // Save to uploads table
      await supabase.from("uploads").insert({
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        category,
        storage_path: storagePath,
        public_url: publicUrl,
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: "done" as const, progress: 100, publicUrl }
            : f
        )
      );
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "error" as const,
                progress: 0,
                errorMessage: err?.message || "Upload failed",
              }
            : f
        )
      );
    }
  }, []);

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

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const photoCount = files.filter((f) => f.type === "photo" && f.status === "done").length;
  const docCount = files.filter((f) => f.type === "document" && f.status === "done").length;

  const categories = [
    { label: "Student Photos", count: photoCount, icon: Image, color: "bg-primary" },
    { label: "Event Photos", count: 0, icon: Image, color: "bg-accent" },
    { label: "Faculty Photos", count: 0, icon: Image, color: "bg-secondary" },
    { label: "Documents", count: docCount, icon: FileText, color: "bg-muted" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALL_ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Upload Content
              </h1>
              <p className="text-muted-foreground mt-1">
                Add photos, quotes, and documents for your yearbook
              </p>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {categories.map((cat) => (
                <div
                  key={cat.label}
                  className="p-3 rounded-xl bg-card border border-border shadow-card flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{cat.label}</p>
                    <p className="text-sm font-display font-semibold text-foreground">
                      {cat.count} files
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-primary-glow mb-4">
                  <UploadIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  Drag & drop files here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse — JPG, PNG, PDF, DOCX (max 10 MB each)
                </p>
                <Button
                  variant="outline"
                  className="font-display border-primary/30 text-primary hover:bg-primary/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Uploaded files */}
            {files.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display font-semibold text-foreground mb-4">
                  Uploaded Files ({files.length})
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-card"
                      >
                        {/* Thumbnail / icon */}
                        {file.status === "done" && file.type === "photo" && file.publicUrl ? (
                          <img
                            src={file.publicUrl}
                            alt={file.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            {file.type === "photo" ? (
                              <Image className="w-5 h-5 text-primary" />
                            ) : (
                              <FileText className="w-5 h-5 text-accent" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                            {file.status === "error" && (
                              <p className="text-xs text-destructive">{file.errorMessage}</p>
                            )}
                          </div>
                          {file.status === "uploading" && (
                            <Progress value={file.progress} className="h-1.5 mt-1" />
                          )}
                        </div>

                        {/* Status icon */}
                        {file.status === "uploading" && (
                          <Loader2 className="w-5 h-5 text-primary shrink-0 animate-spin" />
                        )}
                        {file.status === "done" && (
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        )}
                        {file.status === "error" && (
                          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                        )}

                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Continue */}
            <div className="flex justify-end mt-8">
              <Button
                size="lg"
                className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display h-12 px-8"
                onClick={() => navigate("/templates")}
              >
                Choose Template
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
