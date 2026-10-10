"use client";

import { useOthers } from "@liveblocks/react/suspense";
import type { ProjectCollaboratorRole } from "@prisma/client";
import Image from "next/image";
import { Copy, Share2, Shield, UserMinus } from "lucide-react";
import { useState } from "react";

export interface ProjectCollaboratorSummary {
  id: string;
  email: string;
  role: ProjectCollaboratorRole;
}

interface WorkspaceCollaborationControlsProps {
  projectId: string;
  isProjectOwner: boolean;
  collaborators: ProjectCollaboratorSummary[];
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkspaceCollaborationControls({
  projectId,
  isProjectOwner,
  collaborators,
}: WorkspaceCollaborationControlsProps) {
  const others = useOthers();
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [permission, setPermission] = useState<ProjectCollaboratorRole>("ADMIN");
  const [roster, setRoster] = useState(collaborators);
  const [activeCollaboratorId, setActiveCollaboratorId] = useState<string | null>(
    null,
  );
  const [pendingCollaboratorId, setPendingCollaboratorId] = useState<
    string | null
  >(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  async function copyInviteLink() {
    setFeedback(null);
    setFeedbackIsError(false);

    let response: Response;
    try {
      response = await fetch(`/api/projects/${projectId}/token`);
    } catch {
      setFeedback("Unable to request a project invite token.");
      setFeedbackIsError(true);
      return;
    }

    if (!response.ok) {
      setFeedback("Unable to create an invite link for this project.");
      setFeedbackIsError(true);
      return;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      setFeedback("The invite token response was invalid.");
      setFeedbackIsError(true);
      return;
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("token" in payload) ||
      typeof payload.token !== "string"
    ) {
      setFeedback("The invite token response was invalid.");
      setFeedbackIsError(true);
      return;
    }

    const inviteUrl = new URL(
      `/editor/${encodeURIComponent(projectId)}`,
      window.location.origin,
    );
    inviteUrl.searchParams.set("token", payload.token);
    inviteUrl.searchParams.set(
      "permission",
      permission === "ADMIN" ? "edit" : "view",
    );

    try {
      await navigator.clipboard.writeText(inviteUrl.toString());
    } catch {
      setFeedback("Clipboard access is unavailable in this browser.");
      setFeedbackIsError(true);
      return;
    }

    setFeedback("Invite link copied.");
    setShareIsOpen(false);
  }

  async function updateRole(
    collaborator: ProjectCollaboratorSummary,
    role: ProjectCollaboratorRole,
  ) {
    setPendingCollaboratorId(collaborator.id);
    setFeedback(null);
    setFeedbackIsError(false);

    let response: Response;
    try {
      response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId: collaborator.id, role }),
      });
    } catch {
      setFeedback("Unable to update collaborator permissions.");
      setFeedbackIsError(true);
      setPendingCollaboratorId(null);
      return;
    }

    if (!response.ok) {
      setFeedback("Unable to update collaborator permissions.");
      setFeedbackIsError(true);
      setPendingCollaboratorId(null);
      return;
    }

    setRoster((current) =>
      current.map((item) =>
        item.id === collaborator.id ? { ...item, role } : item,
      ),
    );
    setFeedback(
      `${collaborator.email} can now ${role === "ADMIN" ? "edit" : "view"} this project.`,
    );
    setPendingCollaboratorId(null);
  }

  async function kickCollaborator(collaborator: ProjectCollaboratorSummary) {
    setPendingCollaboratorId(collaborator.id);
    setFeedback(null);
    setFeedbackIsError(false);

    let response: Response;
    try {
      response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId: collaborator.id }),
      });
    } catch {
      setFeedback("Unable to remove this collaborator.");
      setFeedbackIsError(true);
      setPendingCollaboratorId(null);
      return;
    }

    if (!response.ok) {
      setFeedback("Unable to remove this collaborator.");
      setFeedbackIsError(true);
      setPendingCollaboratorId(null);
      return;
    }

    setRoster((current) => current.filter((item) => item.id !== collaborator.id));
    setActiveCollaboratorId(null);
    setFeedback("Collaborator removed.");
    setPendingCollaboratorId(null);
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative">
        <button
          type="button"
          aria-expanded={shareIsOpen}
          aria-haspopup="dialog"
          disabled={!isProjectOwner}
          onClick={() => setShareIsOpen((open) => !open)}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 aria-hidden="true" className="h-4 w-4" />
          Share
        </button>
        {shareIsOpen && isProjectOwner ? (
          <section
            aria-label="Share project"
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-[var(--text-primary)] shadow-xl"
          >
            <label
              htmlFor="project-share-permission"
              className="mb-2 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Link permission
            </label>
            <select
              id="project-share-permission"
              value={permission}
              onChange={(event) =>
                setPermission(
                  event.target.value === "VIEWER" ? "VIEWER" : "ADMIN",
                )
              }
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
            >
              <option value="ADMIN">Can Edit</option>
              <option value="VIEWER">View Only</option>
            </select>
            <button
              type="button"
              onClick={copyInviteLink}
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-focus)] px-3 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--panel)]"
            >
              <Copy aria-hidden="true" className="h-4 w-4" />
              Copy invite link
            </button>
          </section>
        ) : null}
      </div>

      <div
        className="flex max-w-48 items-center justify-center"
        aria-label={`${others.length} active collaborators`}
      >
        <ul className="flex items-center justify-center -space-x-2">
          {others.map((other) => {
            const collaborator = roster.find(
              (item) => item.id === other.info.collaboratorId,
            );
            const name = other.info.name || "Collaborator";
            const isSelected = collaborator?.id === activeCollaboratorId;
            const pending = collaborator?.id === pendingCollaboratorId;

            return (
              <li className="relative" key={other.connectionId}>
                {isProjectOwner && collaborator ? (
                  <button
                    type="button"
                    aria-label={`Manage ${name}`}
                    aria-expanded={isSelected}
                    aria-haspopup="dialog"
                    onClick={() =>
                      setActiveCollaboratorId((activeId) =>
                        activeId === collaborator.id ? null : collaborator.id,
                      )
                    }
                    className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--panel)] text-[10px] font-semibold text-[var(--background)] outline-none transition-transform hover:z-10 hover:scale-110 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
                    style={{ backgroundColor: other.info.color }}
                  >
                    {other.info.avatar ? (
                      <Image
                        src={other.info.avatar}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(name)
                    )}
                  </button>
                ) : (
                  <span
                    aria-label={`${name} active`}
                    title={name}
                    className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--panel)] text-[10px] font-semibold text-[var(--background)]"
                    style={{ backgroundColor: other.info.color }}
                  >
                    {other.info.avatar ? (
                      <Image
                        src={other.info.avatar}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(name)
                    )}
                  </span>
                )}
                {isSelected && collaborator ? (
                  <section
                    aria-label={`Manage ${name}`}
                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 text-[var(--text-primary)] shadow-xl"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Shield
                        aria-hidden="true"
                        className="h-4 w-4 text-[var(--accent-focus)]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {collaborator.email}
                        </p>
                      </div>
                    </div>
                    <label
                      htmlFor={`collaborator-role-${collaborator.id}`}
                      className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
                    >
                      Permission
                    </label>
                    <select
                      id={`collaborator-role-${collaborator.id}`}
                      value={collaborator.role}
                      disabled={pending}
                      onChange={(event) =>
                        void updateRole(
                          collaborator,
                          event.target.value === "VIEWER" ? "VIEWER" : "ADMIN",
                        )
                      }
                      className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] disabled:opacity-50"
                    >
                      <option value="ADMIN">Can Edit</option>
                      <option value="VIEWER">View Only</option>
                    </select>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void kickCollaborator(collaborator)}
                      className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[var(--state-error)]/40 text-sm font-medium text-[var(--state-error)] transition-colors hover:bg-[var(--state-error)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-error)] disabled:cursor-wait disabled:opacity-50"
                    >
                      <UserMinus aria-hidden="true" className="h-4 w-4" />
                      Kick User
                    </button>
                  </section>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      {feedback ? (
        <span
          role={feedbackIsError ? "alert" : "status"}
          className={`sr-only ${
            feedbackIsError ? "text-[var(--state-error)]" : ""
          }`}
        >
          {feedback}
        </span>
      ) : null}
    </div>
  );
}
