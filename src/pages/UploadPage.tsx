import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Upload as UploadIcon,
  Image,
  FileText,
  X,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: "photo" | "document";
  preview?: string;
}

const mockFiles: UploadedFile[] = [
  { id: "1", name: "class_photo_01.jpg", size: "2.4 MB", type: "photo" },
  { id: "2", name: "event_cultural_fest.jpg", size: "3.1 MB", type: "photo" },
  { id: "3", name: "principal_message.docx", size: "145 KB", type: "document" },
  { id: "4", name: "toppers_list.xlsx", size: "89 KB", type: "document" },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>(mockFiles);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const categories = [
    { label: "Student Photos", count: 0, icon: Image, color: "bg-primary" },
    { label: "Event Photos", count: 0, icon: Image, color: "bg-accent" },
    { label: "Faculty Photos", count: 0, icon: Image, color: "bg-indigo-light" },
    { label: "Documents", count: 0, icon: FileText, color: "bg-gold-dark" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center ${
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
                  or click to browse — supports JPG, PNG, PDF, DOCX
                </p>
                <Button
                  variant="outline"
                  className="font-display border-primary/30 text-primary hover:bg-primary/5"
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
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-card"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        {file.type === "photo" ? (
                          <Image className="w-5 h-5 text-primary" />
                        ) : (
                          <FileText className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
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
