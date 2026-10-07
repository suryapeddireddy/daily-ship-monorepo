"use client";

import { useMemo, useState } from "react";

export interface WorkspaceProject {
  id: string;
  name: string;
  slug: string;
}

export type ProjectDialogType = "create" | "rename" | "delete" | null;

const INITIAL_PROJECTS: WorkspaceProject[] = [
  {
    id: "mock-project-architecture",
    name: "AI Architecture Studio",
    slug: "ai-architecture-studio",
  },
  {
    id: "mock-project-payments",
    name: "Payments Platform",
    slug: "payments-platform",
  },
];

function createSlugSuffix(): string {
  return globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 5);
}

function slugifyProjectName(name: string, suffix: string): string {
  const titleSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (!name.trim()) {
    return "";
  }

  return `${titleSlug || "project"}-${suffix}`;
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<ProjectDialogType>(null);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);
  const [projectNameInput, setProjectNameInput] = useState("");
  const [slugSuffix, setSlugSuffix] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeProject = projects.find(
    (project) => project.id === activeProjectId,
  ) ?? null;
  const focusedProject = projects.find(
    (project) => project.id === focusedProjectId,
  ) ?? null;
  const generatedSlug = useMemo(
    () => slugifyProjectName(projectNameInput, slugSuffix),
    [projectNameInput, slugSuffix],
  );

  function closeDialog() {
    if (isSubmitting) {
      return;
    }

    setActiveDialog(null);
    setFocusedProjectId(null);
    setFormError(null);
  }

  function openCreateDialog() {
    setProjectNameInput("");
    setSlugSuffix(createSlugSuffix());
    setFocusedProjectId(null);
    setFormError(null);
    setActiveDialog("create");
  }

  function openRenameDialog(project: WorkspaceProject) {
    setFocusedProjectId(project.id);
    setProjectNameInput(project.name);
    setFormError(null);
    setActiveDialog("rename");
  }

  function openDeleteDialog(project: WorkspaceProject) {
    setFocusedProjectId(project.id);
    setProjectNameInput(project.name);
    setFormError(null);
    setActiveDialog("delete");
  }

  function updateProjectNameInput(value: string) {
    setProjectNameInput(value);
    setFormError(null);
  }

  async function submitCreate() {
    const name = projectNameInput.trim();
    if (!name) {
      setFormError("Enter a project name to continue.");
      return;
    }

    setIsSubmitting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 350));

    const project: WorkspaceProject = {
      id: globalThis.crypto.randomUUID(),
      name,
      slug: generatedSlug,
    };
    setProjects((currentProjects) => [...currentProjects, project]);
    setActiveProjectId(project.id);
    setIsSubmitting(false);
    setActiveDialog(null);
    setFocusedProjectId(null);
  }

  async function submitRename() {
    const name = projectNameInput.trim();
    if (!focusedProjectId) {
      return;
    }
    if (!name) {
      setFormError("Enter a project name to continue.");
      return;
    }

    setIsSubmitting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === focusedProjectId ? { ...project, name } : project,
      ),
    );
    setIsSubmitting(false);
    setActiveDialog(null);
    setFocusedProjectId(null);
  }

  async function submitDelete() {
    if (!focusedProjectId) {
      return;
    }

    setIsSubmitting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== focusedProjectId),
    );
    setActiveProjectId((currentProjectId) =>
      currentProjectId === focusedProjectId ? null : currentProjectId,
    );
    setIsSubmitting(false);
    setActiveDialog(null);
    setFocusedProjectId(null);
  }

  return {
    activeDialog,
    activeProject,
    activeProjectId,
    closeDialog,
    focusedProject,
    formError,
    generatedSlug,
    isSubmitting,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projectNameInput,
    projects,
    setActiveProjectId,
    setProjectNameInput,
    submitCreate,
    submitDelete,
    submitRename,
    updateProjectNameInput,
  };
}
