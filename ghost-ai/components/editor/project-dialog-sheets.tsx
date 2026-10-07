"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { useProjectDialogs } from "@/hooks/use-project-dialogs";

interface ProjectDialogSheetsProps {
  dialogs: ReturnType<typeof useProjectDialogs>;
}

export function ProjectDialogSheets({ dialogs }: ProjectDialogSheetsProps) {
  const {
    activeDialog,
    closeDialog,
    focusedProject,
    formError,
    generatedSlug,
    isSubmitting,
    projectNameInput,
    submitCreate,
    submitDelete,
    submitRename,
    updateProjectNameInput,
  } = dialogs;

  return (
    <Dialog
      open={activeDialog !== null}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog();
        }
      }}
    >
      {activeDialog === "create" && (
        <DialogContent className="rounded-3xl border border-white/[0.08] bg-[var(--panel)] p-6 text-[var(--text-primary)] sm:max-w-md">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-lg">Create a project</DialogTitle>
            <DialogDescription>
              Give your workspace a name. You can change it later.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitCreate();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="create-project-name"
                className="text-sm font-medium"
              >
                Project name
              </label>
              <Input
                id="create-project-name"
                autoFocus
                value={projectNameInput}
                onChange={(event) => updateProjectNameInput(event.target.value)}
                placeholder="e.g. Payments Platform"
                aria-invalid={Boolean(formError)}
                aria-describedby={
                  formError ? "create-project-error" : "project-slug-preview"
                }
              />
              {formError ? (
                <p
                  id="create-project-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {formError}
                </p>
              ) : (
                <p
                  id="project-slug-preview"
                  className="text-xs text-muted-foreground"
                >
                  Workspace slug:{" "}
                  <span className="font-mono text-[var(--text-primary)]">
                    {generatedSlug || "your-project"}
                  </span>
                </p>
              )}
            </div>
            <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                )}
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}

      {activeDialog === "rename" && focusedProject && (
        <DialogContent className="rounded-3xl border border-white/[0.08] bg-[var(--panel)] p-6 text-[var(--text-primary)] sm:max-w-md">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-lg">Rename project</DialogTitle>
            <DialogDescription>
              Update the display name for {focusedProject.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitRename();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="rename-project-name"
                className="text-sm font-medium"
              >
                Project name
              </label>
              <Input
                id="rename-project-name"
                autoFocus
                value={projectNameInput}
                onChange={(event) => updateProjectNameInput(event.target.value)}
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? "rename-project-error" : undefined}
              />
              {formError && (
                <p
                  id="rename-project-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {formError}
                </p>
              )}
            </div>
            <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                )}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}

      {activeDialog === "delete" && focusedProject && (
        <DialogContent className="rounded-3xl border border-white/[0.08] bg-[var(--panel)] p-6 text-[var(--text-primary)] sm:max-w-md">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-lg">Delete project?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{focusedProject.name}</strong> from this
              local workspace list. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void submitDelete()}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              )}
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
