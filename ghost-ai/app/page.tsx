import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Terminal } from "lucide-react";

export default async function HomePortal() {
  const { userId } = await auth();

  if (userId) {
    redirect("/editor/sandbox-project");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] bg-[radial-gradient(var(--panel)_1px,transparent_1px)] p-6 text-center text-[var(--text-primary)] [background-size:24px_24px]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <Terminal className="h-6 w-6 text-[var(--accent-focus)]" />
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Ghost AI Workspace Portal</h1>
      <p className="mb-6 max-w-sm text-sm text-[var(--text-muted)]">
        Enter your active systems engineering pipeline canvas directly via the secure deployment terminal link.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="flex items-center gap-1.5 rounded-md bg-[var(--accent-focus)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-all hover:opacity-90"
        >
          Sign In
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/sign-up"
          className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-focus)]"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
