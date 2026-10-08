import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

import { isProjectId } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

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

  const project = await prisma.project.findFirst({
    where: {
      id: room,
      OR: [
        { ownerId: userId },
        ...(verifiedEmails.length > 0
          ? [
              {
                collaborators: {
                  some: {
                    email: {
                      in: verifiedEmails,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ]
          : []),
      ],
    },
    select: { id: true },
  });

  if (!project) {
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
  const session = liveblocks.prepareSession(userId);
  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
