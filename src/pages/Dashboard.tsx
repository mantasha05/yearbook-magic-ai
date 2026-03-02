import { motion } from "framer-motion";
import { Plus, FolderOpen, Clock, BookOpen, MoreVertical, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import yearbookCover from "@/assets/yearbook-cover.png";

const mockProjects = [
  {
    id: 1,
    name: "CSE Batch 2025 Yearbook",
    college: "IIT Delhi",
    updatedAt: "2 days ago",
    sections: 8,
    photos: 342,
    template: "Vibrant",
    cover: yearbookCover,
  },
  {
    id: 2,
    name: "Annual Magazine 2024",
    college: "NIT Trichy",
    updatedAt: "1 week ago",
    sections: 12,
    photos: 580,
    template: "Classic",
    cover: yearbookCover,
  },
  {
    id: 3,
    name: "Farewell Memories",
    college: "BITS Pilani",
    updatedAt: "3 weeks ago",
    sections: 6,
    photos: 210,
    template: "Minimal",
    cover: yearbookCover,
  },
];

const Dashboard = () => {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-card border-border"
              />
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
              { label: "Total Projects", value: "3", icon: FolderOpen },
              { label: "Photos Uploaded", value: "1,132", icon: BookOpen },
              { label: "Sections Created", value: "26", icon: BookOpen },
              { label: "Last Active", value: "2 days ago", icon: Clock },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-card border border-border shadow-card"
              >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
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

            {/* Existing projects */}
            {mockProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
              >
                <Link
                  to={`/upload`}
                  className="group block rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Cover */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={project.cover}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <button className="w-8 h-8 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-accent/90 text-accent-foreground text-xs font-semibold font-display">
                        {project.template}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-card-foreground truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{project.college}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{project.sections} sections</span>
                      <span>{project.photos} photos</span>
                      <span className="ml-auto">{project.updatedAt}</span>
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
