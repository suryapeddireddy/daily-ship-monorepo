import { auth, currentUser } from "@clerk/nextjs/server";
import { normalizeProjectName } from "@/lib/project-name";
import { getProjectsForUser } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const emailAddresses =
    user?.emailAddresses
      .filter(({ verification }) => verification?.status === "verified")
      .map(({ emailAddress }) => emailAddress) ?? [];
  const projects = await getProjectsForUser(userId, emailAddresses);

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
  const rawName = payload.name === undefined ? "Untitled Project" : payload.name;
  const description =
    payload.description === undefined || payload.description === null
      ? null
      : payload.description;

  if (typeof rawName !== "string" || (description !== null && typeof description !== "string")) {
    return Response.json({ error: "Invalid project fields" }, { status: 400 });
  }

  const name = normalizeProjectName(rawName);
  if (!name) {
    return Response.json(
      { error: "Project names must include at least one letter or number." },
      { status: 400 },
    );
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
