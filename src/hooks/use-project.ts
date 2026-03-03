import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProjectSection {
  id: string;
  section_key: string;
  title: string;
  icon_name: string;
  enabled: boolean;
  sort_order: number;
  content: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  template: string;
  college: string;
  batch: string;
  department: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SECTIONS = [
  { section_key: "principal", title: "Principal's Message", icon_name: "MessageSquare", sort_order: 0 },
  { section_key: "toppers", title: "Academic Stars & Toppers", icon_name: "Award", sort_order: 1 },
  { section_key: "events", title: "Events Gallery", icon_name: "Camera", sort_order: 2 },
  { section_key: "memes", title: "Fun Memes & Candid Moments", icon_name: "Laugh", sort_order: 3 },
  { section_key: "farewell", title: "Farewell & Memories", icon_name: "Heart", sort_order: 4 },
  { section_key: "qr", title: "QR Code - College Anthem", icon_name: "QrCode", sort_order: 5 },
];

export function useProject() {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load or create project
  useEffect(() => {
    if (!user) return;

    const loadOrCreate = async () => {
      setLoading(true);

      // Try to load existing project
      const { data: existingProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      let proj: any;

      if (existingProjects && existingProjects.length > 0) {
        proj = existingProjects[0];
      } else {
        // Auto-create
        const { data: newProj, error } = await supabase
          .from("projects")
          .insert({ user_id: user.id, name: "My Yearbook", template: "vibrant" })
          .select()
          .single();

        if (error || !newProj) {
          console.error("Failed to create project", error);
          setLoading(false);
          return;
        }
        proj = newProj;

        // Seed default sections
        const sectionsToInsert = DEFAULT_SECTIONS.map((s) => ({
          project_id: proj.id,
          ...s,
          enabled: true,
          content: {},
        }));
        await supabase.from("project_sections").insert(sectionsToInsert);
      }

      setProject(proj);

      // Load sections
      const { data: secs } = await supabase
        .from("project_sections")
        .select("*")
        .eq("project_id", proj.id)
        .order("sort_order", { ascending: true });

      setSections(
        (secs || []).map((s: any) => ({
          id: s.id,
          section_key: s.section_key,
          title: s.title,
          icon_name: s.icon_name,
          enabled: s.enabled,
          sort_order: s.sort_order,
          content: s.content || {},
        }))
      );

      setLoading(false);
    };

    loadOrCreate();
  }, [user]);

  const saveSections = useCallback(
    async (updatedSections: ProjectSection[]) => {
      if (!project) return;
      setSections(updatedSections);

      // Upsert all sections
      for (let i = 0; i < updatedSections.length; i++) {
        const s = updatedSections[i];
        await supabase
          .from("project_sections")
          .update({
            title: s.title,
            icon_name: s.icon_name,
            enabled: s.enabled,
            sort_order: i,
            content: s.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", s.id);
      }

      await supabase
        .from("projects")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", project.id);
    },
    [project]
  );

  const toggleSection = useCallback(
    (sectionKey: string) => {
      const updated = sections.map((s) =>
        s.section_key === sectionKey ? { ...s, enabled: !s.enabled } : s
      );
      saveSections(updated);
    },
    [sections, saveSections]
  );

  const reorderSections = useCallback(
    (newOrder: ProjectSection[]) => {
      saveSections(newOrder);
    },
    [saveSections]
  );

  const removeSection = useCallback(
    async (sectionId: string) => {
      await supabase.from("project_sections").delete().eq("id", sectionId);
      const updated = sections.filter((s) => s.id !== sectionId);
      setSections(updated);
    },
    [sections]
  );

  return {
    project,
    sections,
    loading,
    toggleSection,
    reorderSections,
    removeSection,
    saveSections,
  };
}
