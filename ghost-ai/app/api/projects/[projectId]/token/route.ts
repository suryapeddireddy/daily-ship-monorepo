import { randomBytes } from "node:crypto";
import { auth } from "@clerk/nextjs/server";

import { isProjectId } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: Request, context: ProjectRouteContext) {
  const { projectId } = await context.params;
  if (!isProjectId(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.$transaction(async (transaction) => {
    const project = await transaction.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, shareToken: true },
    });

    if (!project) {
      return { status: 404 as const, error: "Project not found" };
    }
    if (project.ownerId !== userId) {
      return { status: 403 as const, error: "Forbidden" };
    }
    if (project.shareToken) {
      return { status: 200 as const, token: project.shareToken };
    }

    const generatedToken = randomBytes(32).toString("hex");
    await transaction.project.updateMany({
      where: { id: projectId, ownerId: userId, shareToken: null },
      data: { shareToken: generatedToken },
    });

    const updatedProject = await transaction.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, shareToken: true },
    });

    if (!updatedProject) {
      return { status: 404 as const, error: "Project not found" };
    }
    if (updatedProject.ownerId !== userId) {
      return { status: 403 as const, error: "Forbidden" };
    }
    if (!updatedProject.shareToken) {
      return { status: 500 as const, error: "Unable to create project token" };
    }

    return { status: 200 as const, token: updatedProject.shareToken };
  });

  if (result.status !== 200) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ token: result.token });
}
