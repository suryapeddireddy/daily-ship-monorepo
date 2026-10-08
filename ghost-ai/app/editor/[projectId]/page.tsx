import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getProjectsForUser, isProjectId } from "@/lib/projects";

interface ProjectWorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { projectId } = await params;
  if (!isProjectId(projectId)) {
    notFound();
  }

  const user = await currentUser();
  const emailAddresses =
    user?.emailAddresses
      .filter(({ verification }) => verification?.status === "verified")
      .map(({ emailAddress }) => emailAddress) ?? [];
  const projects = await getProjectsForUser(userId, emailAddresses);

  if (!projects.some((project) => project.id === projectId)) {
    notFound();
  }

  return <EditorWorkspace projects={projects} activeProjectId={projectId} />;
}
