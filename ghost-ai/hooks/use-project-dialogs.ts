"use client";

import { useMemo, useState } from "react";

import type { ProjectSummary } from "@/lib/projects";
import { useProjectActions } from "@/hooks/useProjectActions";
import { normalizeProjectName } from "@/lib/project-name";

export type WorkspaceProject = ProjectSummary;

export type ProjectDialogType = "create" | "rename" | "delete" | null;

function createSlugSuffix(): string {
  return globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 5);
}

function slugifyProjectName(name: string, suffix: string): string {
  const titleSlug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!name.trim()) {
    return "";
  }

  return `${titleSlug || "project"}-${suffix}`;
}

export function useProjectDialogs(
  projects: WorkspaceProject[],
  activeProjectId: string | null,
) {
  const actions = useProjectActions();
  const [activeDialog, setActiveDialog] = useState<ProjectDialogType>(null);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);
  const [projectNameInput, setProjectNameInput] = useState("");
  const [slugSuffix, setSlugSuffix] = useState("");
  const [localFormError, setLocalFormError] = useState<string | null>(null);

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
  const formError = localFormError ?? actions.error;

  function closeDialog() {
    if (actions.isLoading) {
      return;
    }

    setActiveDialog(null);
    setFocusedProjectId(null);
    setLocalFormError(null);
  }

  function openCreateDialog() {
    actions.clearError();
    setProjectNameInput("");
    setSlugSuffix(createSlugSuffix());
    setFocusedProjectId(null);
    setLocalFormError(null);
    setActiveDialog("create");
  }

  function openRenameDialog(project: WorkspaceProject) {
    actions.clearError();
    setFocusedProjectId(project.id);
    setProjectNameInput(project.name);
    setLocalFormError(null);
    setActiveDialog("rename");
  }

  function openDeleteDialog(project: WorkspaceProject) {
    actions.clearError();
    setFocusedProjectId(project.id);
    setProjectNameInput(project.name);
    setLocalFormError(null);
    setActiveDialog("delete");
  }

  function updateProjectNameInput(value: string) {
    setProjectNameInput(value);
    setLocalFormError(null);
  }

  async function submitCreate() {
    const name = normalizeProjectName(projectNameInput);
    if (!name) {
      setLocalFormError("Project names must include at least one letter or number.");
      return;
    }

    const project = await actions.createProject(name);
    if (project) {
      setActiveDialog(null);
      setFocusedProjectId(null);
    }
  }

  async function submitRename() {
    const name = normalizeProjectName(projectNameInput);
    if (!focusedProjectId) {
      return;
    }
    if (!name) {
      setLocalFormError("Project names must include at least one letter or number.");
      return;
    }

    const renamed = await actions.renameProject(focusedProjectId, name);
    if (renamed) {
      setActiveDialog(null);
      setFocusedProjectId(null);
    }
  }

  async function submitDelete() {
    if (!focusedProjectId) {
      return;
    }

    const deleted = await actions.deleteProject(focusedProjectId);
    if (deleted) {
      setActiveDialog(null);
      setFocusedProjectId(null);
    }
  }

  return {
    activeDialog,
    activeProject,
    activeProjectId,
    error: actions.error,
    closeDialog,
    focusedProject,
    formError,
    generatedSlug,
    isSubmitting: actions.isLoading,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projectNameInput,
    projects,
    setProjectNameInput,
    submitCreate,
    submitDelete,
    submitRename,
    updateProjectNameInput,
  };
}
