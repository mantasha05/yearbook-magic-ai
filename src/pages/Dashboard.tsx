import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, FolderOpen, Clock, BookOpen, ImageIcon, MoreVertical, Search, Trash2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import yearbookCover from "@/assets/yearbook-cover.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectRow {
  id: string;
  name: string;
  template: string;
  college: string;
  batch: string;
  department: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [uploadCounts, setUploadCounts] = useState<Record<string, number>>({});
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      // Load projects
      const { data: projs } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      const projectList = (projs || []) as unknown as ProjectRow[];
      setProjects(projectList);

      if (projectList.length > 0) {
        const projectIds = projectList.map((p) => p.id);

        // Count uploads per project
        const { data: uploads } = await supabase
          .from("uploads")
          .select("id, project_id")
          .eq("user_id", user.id);

        const uCounts: Record<string, number> = {};
        (uploads || []).forEach((u: any) => {
          const pid = u.project_id || "none";
          uCounts[pid] = (uCounts[pid] || 0) + 1;
        });
        setUploadCounts(uCounts);

        // Count sections per project
        const { data: sections } = await supabase
          .from("project_sections")
          .select("id, project_id")
          .in("project_id", projectIds);

        const sCounts: Record<string, number> = {};
        (sections || []).forEach((s: any) => {
          sCounts[s.project_id] = (sCounts[s.project_id] || 0) + 1;
        });
        setSectionCounts(sCounts);
      }

      setLoading(false);
    };
    load();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm("Delete this project? This cannot be undone.");
    if (!confirmed) return;

    await supabase.from("project_sections").delete().eq("project_id", projectId);
    await supabase.from("projects").delete().eq("id", projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast({ title: "Project deleted" });
  };

  const totalPhotos = Object.values(uploadCounts).reduce((a, b) => a + b, 0);
  const totalSections = Object.values(sectionCounts).reduce((a, b) => a + b, 0);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.college.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
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
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">My Projects</h1>
              <p className="text-muted-foreground mt-1">Create and manage your yearbook projects</p>
            </div>
            <Button
              className="bg-gradient-hero shadow-primary-glow hover:opacity-90 text-primary-foreground font-display"
              asChild
            >
              <Link to="/create">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Link>
            </Button>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-10 bg-card border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            {[
              { label: "Total Projects", value: String(projects.length), icon: FolderOpen },
              { label: "Photos Uploaded", value: String(totalPhotos), icon: ImageIcon },
              { label: "Sections Created", value: String(totalSections), icon: BookOpen },
              { label: "Last Active", value: projects.length > 0 ? timeAgo(projects[0].updated_at) : "—", icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-card border border-border shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Projects grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New project card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link
                to="/create"
                className="group flex flex-col items-center justify-center h-full min-h-[280px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-primary-glow group-hover:scale-110 transition-transform mb-4">
                  <Plus className="w-8 h-8 text-primary-foreground" />
                </div>
                <span className="font-display font-semibold text-foreground">Create New Project</span>
                <span className="text-sm text-muted-foreground mt-1">Start from scratch or template</span>
              </Link>
            </motion.div>

            {/* Real projects */}
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
              >
                <Link
                  to="/upload"
                  className="group block rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Cover */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={yearbookCover}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.preventDefault()}
                            className="w-8 h-8 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => handleDelete(e as any, project.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-accent/90 text-accent-foreground text-xs font-semibold font-display capitalize">
                        {project.template}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-card-foreground truncate">{project.name}</h3>
                    {project.college && <p className="text-sm text-muted-foreground mt-0.5">{project.college}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{sectionCounts[project.id] || 0} sections</span>
                      <span>{uploadCounts[project.id] || 0} photos</span>
                      <span className="ml-auto">{timeAgo(project.updated_at)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
