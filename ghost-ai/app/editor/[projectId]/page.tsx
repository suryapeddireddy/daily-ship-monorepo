import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { EditorProviders } from "@/components/editor/editor-providers";
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
        <h1 className="text-xl font-semibold tracking-tight">Access Denied</h1>
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
    user?.emailAddresses
      .filter(({ verification }) => verification?.status === "verified")
      .map(({ emailAddress }) => emailAddress) ?? [];
  const [project, projects] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    }),
    getProjectsForUser(userId, emailAddresses),
  ]);

  if (!project) {
    redirect("/editor");
  }

  if (!projects.some((accessibleProject) => accessibleProject.id === projectId)) {
    return <AccessDenied />;
  }

  return (
    <EditorProviders roomId={projectId}>
      <EditorWorkspace projects={projects} activeProjectId={projectId} />
    </EditorProviders>
  );
}
