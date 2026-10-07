import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function EditorLanding() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  redirect("/editor/sandbox-project");
}
