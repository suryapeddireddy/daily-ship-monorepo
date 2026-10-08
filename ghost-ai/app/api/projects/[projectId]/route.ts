import { auth } from "@clerk/nextjs/server";
import { isProjectId } from "@/lib/projects";
import { normalizeProjectName } from "@/lib/project-name";
import { prisma } from "@/lib/prisma";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  if (!isProjectId(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (typeof payload.name !== "string") {
    return Response.json({ error: "A project name is required" }, { status: 400 });
  }

  const name = normalizeProjectName(payload.name);
  if (!name) {
    return Response.json(
      { error: "Project names must include at least one letter or number." },
      { status: 400 },
    );
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

  const updatedProject = await prisma.project.update({
    where: { id: projectId, ownerId: userId },
    data: { name },
  });

  return Response.json(updatedProject);
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  if (!isProjectId(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
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

  await prisma.project.delete({
    where: { id: projectId, ownerId: userId },
  });

  return new Response(null, { status: 204 });
}
