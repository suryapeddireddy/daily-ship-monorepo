import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

import { isProjectId } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { NODE_COLORS } from "@/types/canvas";

function getPresenceColor(identity: string): string {
  let hash = 0;
  for (const character of identity) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return NODE_COLORS[hash % NODE_COLORS.length].text;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const room = (payload as Record<string, unknown>).room;
  if (typeof room !== "string" || !isProjectId(room)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const user = await currentUser();
  const verifiedEmails =
    user?.emailAddresses
      .filter(({ verification }) => verification?.status === "verified")
      .map(({ emailAddress }) => emailAddress) ?? [];

  const project = await prisma.project.findUnique({
    where: { id: room },
    select: {
      ownerId: true,
      collaborators: {
        where: {
          email: { in: verifiedEmails, mode: "insensitive" },
        },
        select: { id: true, role: true },
        take: 1,
      },
    },
  });

  if (
    !project ||
    (project.ownerId !== userId && project.collaborators.length === 0)
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    return Response.json(
      { error: "Liveblocks authentication is not configured" },
      { status: 500 },
    );
  }

  const liveblocks = new Liveblocks({ secret });
  const identity = user?.primaryEmailAddress?.emailAddress ?? userId;
  const name =
    [user?.firstName, user?.lastName]
      .filter((part): part is string => Boolean(part))
      .join(" ") ||
    user?.username ||
    identity;
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      color: getPresenceColor(identity),
      ...(project.collaborators[0]
        ? { collaboratorId: project.collaborators[0].id }
        : {}),
      ...(user?.imageUrl ? { avatar: user.imageUrl } : {}),
    },
  });
  const role = project.collaborators[0]?.role;
  session.allow(
    room,
    project.ownerId === userId || role === "ADMIN"
      ? session.FULL_ACCESS
      : session.READ_ACCESS,
  );

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
