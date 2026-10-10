import { auth } from "@clerk/nextjs/server";

import { isProjectId } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function DELETE(request: Request, context: ProjectRouteContext) {
  const { projectId } = await context.params;
  if (!isProjectId(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.collaboratorId !== "string") {
    return Response.json(
      { error: "A collaborator ID is required" },
      { status: 400 },
    );
  }
  if (!isProjectId(body.collaboratorId)) {
    return Response.json({ error: "Invalid collaborator ID" }, { status: 400 });
  }

  const deletion = await prisma.projectCollaborator.deleteMany({
    where: { id: body.collaboratorId, projectId },
  });

  if (deletion.count === 0) {
    return Response.json({ error: "Collaborator not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { projectId } = await context.params;
  if (!isProjectId(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    typeof body.collaboratorId !== "string" ||
    (body.role !== "ADMIN" && body.role !== "VIEWER")
  ) {
    return Response.json(
      { error: "A collaborator ID and valid role are required" },
      { status: 400 },
    );
  }
  if (!isProjectId(body.collaboratorId)) {
    return Response.json({ error: "Invalid collaborator ID" }, { status: 400 });
  }

  const updated = await prisma.projectCollaborator.updateMany({
    where: { id: body.collaboratorId, projectId },
    data: { role: body.role },
  });

  if (updated.count === 0) {
    return Response.json({ error: "Collaborator not found" }, { status: 404 });
  }

  return Response.json({ role: body.role });
}
