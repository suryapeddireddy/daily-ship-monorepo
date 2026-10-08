import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getProjectsForUser } from "@/lib/projects";

export default async function EditorLanding() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const emailAddresses =
    user?.emailAddresses
      .filter(({ verification }) => verification?.status === "verified")
      .map(({ emailAddress }) => emailAddress) ?? [];
  const projects = await getProjectsForUser(userId, emailAddresses);

  return <EditorWorkspace projects={projects} activeProjectId={null} />;
}
