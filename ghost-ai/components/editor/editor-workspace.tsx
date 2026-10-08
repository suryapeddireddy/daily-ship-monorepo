"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FolderOpen, Sparkles } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogSheets } from "@/components/editor/project-dialog-sheets";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import type { ProjectSummary } from "@/lib/projects";

interface EditorWorkspaceProps {
  projects: ProjectSummary[];
  activeProjectId: string | null;
}

export function EditorWorkspace({
  projects,
  activeProjectId,
}: EditorWorkspaceProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dialogs = useProjectDialogs(projects, activeProjectId);

  function toggleSidebar() {
    setIsSidebarOpen((open) => !open);
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onMenuClick={toggleSidebar}
        projectName={dialogs.activeProject?.name ?? null}
      />
      <main
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-background px-6"
        aria-label="Editor workspace"
      >
        {dialogs.activeProject ? (
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--panel)]">
              <FolderOpen
                aria-hidden="true"
                className="h-6 w-6 text-primary"
              />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              {dialogs.activeProject.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your workspace is ready. Canvas tools will appear here.
            </p>
          </div>
        ) : (
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--panel)]">
              <Sparkles aria-hidden="true" className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              Welcome to Ghost AI
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome to your AI workspace. Create your first project to get
              started.
            </p>
          </div>
        )}
      </main>
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={dialogs.projects}
        activeProjectId={dialogs.activeProjectId}
        onSelectProject={(projectId) => router.push(`/editor/${projectId}`)}
        onCreateProject={dialogs.openCreateDialog}
        onRenameProject={dialogs.openRenameDialog}
        onDeleteProject={dialogs.openDeleteDialog}
      />
      <ProjectDialogSheets dialogs={dialogs} />
    </div>
  );
}
