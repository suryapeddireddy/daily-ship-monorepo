import { prisma } from "@/lib/prisma";

export interface ProjectSummary {
  id: string;
  name: string;
  isOwner: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function isProjectId(value: string): boolean {
  return UUID_REGEX.test(value);
}

export async function getProjectsForUser(
  userId: string,
  emailAddresses: string[] = [],
): Promise<ProjectSummary[]> {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        ...(emailAddresses.length > 0
          ? [
              {
                collaborators: {
                  some: {
                    email: {
                      in: emailAddresses,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ]
          : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, ownerId: true },
  });

  return projects.map(({ id, name, ownerId }) => ({
    id,
    name,
    isOwner: ownerId === userId,
  }));
}
