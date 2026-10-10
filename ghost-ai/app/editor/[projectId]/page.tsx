import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { RoomProvider } from "@/components/editor/room-provider";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getProjectsForUser, isProjectId } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

interface ProjectWorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="max-w-md rounded-xl border border-white/[0.08] bg-[var(--panel)] p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have permission to view this project workspace.
        </p>
      </section>
    </main>
  );
}

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const { projectId } = await params;
  if (!isProjectId(projectId)) {
    notFound();
  }

  const { userId } = await auth();
  if (!userId) {
    return <AccessDenied />;
  }

  const user = await currentUser();
  const emailAddresses =
    user?.emailAddresses?.map((email) => email.emailAddress) ?? [];

  // Initialize your storage states outside the try scope so the layout can access them
  let project: any = null;
  let projects: any[] = [];
  let databaseError = false;

  // 1. Keep ONLY data fetching inside the try/catch block
  try {
    const [fetchedProject, fetchedProjects] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          ownerId: true,
          canvasBlobUrl: true,
          collaborators: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      getProjectsForUser(userId, emailAddresses),
    ]);
    
    project = fetchedProject;
    projects = fetchedProjects;
  } catch (error) {
    console.error("Workspace page data hydration failure:", error);
    databaseError = true;
  }

  // 2. Early return handles for error and security conditions outside of try/catch
  if (databaseError) {
    return <AccessDenied />;
  }

  if (!project) {
    redirect("/editor");
  }

  if (!projects.some((accessibleProject) => accessibleProject.id === projectId)) {
    return <AccessDenied />;
  }

  // 3. Return the JSX cleanly down here without any try/catch nesting!
  return (
    <RoomProvider projectId={projectId}>
      <EditorWorkspace
        projects={projects}
        activeProjectId={projectId}
        initialCanvasBlobUrl={project.canvasBlobUrl}
        collaborators={
          project.ownerId === userId ? project.collaborators : []
        }
      />
    </RoomProvider>
  );
}
