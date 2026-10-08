"use client";

import { FolderKanban, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { WorkspaceProject } from "@/hooks/use-project-dialogs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: WorkspaceProject[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onRenameProject: (project: WorkspaceProject) => void;
  onDeleteProject: (project: WorkspaceProject) => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close project sidebar"
          className="fixed inset-0 top-14 z-30 cursor-default bg-background/60"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Project workspaces"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed bottom-0 left-0 top-14 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-[var(--panel)] transition-transform duration-200 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Workspaces
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close project sidebar"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <Tabs
          defaultValue="my-systems"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList className="mx-3 mt-3 w-auto">
            <TabsTrigger value="my-systems">My Systems</TabsTrigger>
            <TabsTrigger value="shared-workspaces">Shared Workspaces</TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-systems"
            className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-4"
          >
            <div className="flex-1 space-y-1 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No projects yet
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className={`group flex items-center gap-1 rounded-md border border-transparent p-1 transition-colors ${
                      activeProjectId === project.id
                        ? "border-white/[0.06] bg-background"
                        : "hover:bg-background/70"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                      aria-current={
                        activeProjectId === project.id ? "page" : undefined
                      }
                      onClick={() => onSelectProject(project.id)}
                    >
                      <FolderKanban
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                      />
                      <span className="truncate">{project.name}</span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Rename ${project.name}`}
                      title={`Rename ${project.name}`}
                      onClick={() => onRenameProject(project)}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${project.name}`}
                      title={`Delete ${project.name}`}
                      onClick={() => onDeleteProject(project)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button type="button" className="w-full" onClick={onCreateProject}>
              <Plus aria-hidden="true" />
              Create Project
            </Button>
          </TabsContent>

          <TabsContent
            value="shared-workspaces"
            className="px-4 py-6 text-sm text-muted-foreground"
          >
            Shared workspaces will appear here.
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
