"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { normalizeProjectName } from "@/lib/project-name";
import type { ProjectSummary } from "@/lib/projects";

interface ProjectResponse {
  id: string;
  name: string;
}

function getResponseError(payload: unknown): string | null {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return null;
}

function parseProjectResponse(payload: unknown): ProjectResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("id" in payload) ||
    typeof payload.id !== "string" ||
    !("name" in payload) ||
    typeof payload.name !== "string"
  ) {
    throw new Error("The server returned an invalid project.");
  }

  return { id: payload.id, name: payload.name };
}

async function readProjectResponse(response: Response): Promise<ProjectResponse> {
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(
      getResponseError(payload) ?? "The project request could not be completed.",
    );
  }

  return parseProjectResponse(payload);
}

export function useProjectActions() {
  const router = useRouter();
  const mutationInProgress = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runMutation<T>(mutation: () => Promise<T>): Promise<T | null> {
    if (mutationInProgress.current) {
      return null;
    }

    mutationInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      return await mutation();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected project error occurred.",
      );
      return null;
    } finally {
      mutationInProgress.current = false;
      setIsLoading(false);
    }
  }

  async function createProject(name: string): Promise<ProjectSummary | null> {
    const trimmedName = normalizeProjectName(name);
    if (!trimmedName) {
      setError("Project names must include at least one letter or number.");
      return null;
    }

    const project = await runMutation(async () => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      return readProjectResponse(response);
    });

    if (!project) {
      return null;
    }

    router.push(`/editor/${project.id}`);
    return { ...project, isOwner: true };
  }

  async function renameProject(
    projectId: string,
    name: string,
  ): Promise<boolean> {
    const trimmedName = normalizeProjectName(name);
    if (!trimmedName) {
      setError("Project names must include at least one letter or number.");
      return false;
    }

    const project = await runMutation(async () => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      return readProjectResponse(response);
    });

    if (!project) {
      return false;
    }

    router.refresh();
    return true;
  }

  async function deleteProject(projectId: string): Promise<boolean> {
    const deleted = await runMutation(async () => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          throw new Error("The project could not be deleted.");
        }

        throw new Error(
          getResponseError(payload) ?? "The project could not be deleted.",
        );
      }

      return true;
    });

    if (!deleted) {
      return false;
    }

    router.replace("/editor");
    return true;
  }

  return {
    clearError: () => setError(null),
    createProject,
    deleteProject,
    error,
    isLoading,
    renameProject,
  };
}
