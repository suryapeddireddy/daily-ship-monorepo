import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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
  const name = payload.name === undefined ? "Untitled Project" : payload.name;
  const description =
    payload.description === undefined || payload.description === null
      ? null
      : payload.description;

  if (typeof name !== "string" || (description !== null && typeof description !== "string")) {
    return Response.json({ error: "Invalid project fields" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
      description,
    },
  });

  return Response.json(project, { status: 201 });
}
