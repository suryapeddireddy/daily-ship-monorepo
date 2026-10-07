import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Blocks, ShieldCheck, Sparkles } from "lucide-react";

const authAppearance = {
  elements: {
    card: "border border-[var(--border)] bg-[var(--panel)] shadow-none",
    headerTitle: "text-[var(--text-primary)]",
    headerSubtitle: "text-[var(--text-muted)]",
    footerActionLink: "text-[var(--accent-focus)]",
    formButtonPrimary: "bg-[var(--accent-focus)] text-[var(--text-primary)] hover:opacity-90",
    formFieldLabel: "text-[var(--text-primary)]",
    formFieldInput: "border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)]",
    socialButtonsBlockButton: "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)]",
    identityPreview: "bg-[var(--background)]",
  },
};

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/editor/sandbox-project");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--text-primary)]">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--panel)] shadow-2xl shadow-black/30 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between border-b border-[var(--border)] bg-[radial-gradient(var(--panel)_1px,transparent_1px)] p-8 [background-size:24px_24px] lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
              <Blocks className="h-4 w-4 text-[var(--accent-focus)]" />
              Ghost AI
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                Establish your secure access layer.
              </h1>
              <p className="max-w-md text-sm leading-6 text-[var(--text-muted)]">
                Join your systems workspace with identity-backed access to each active editor and review flow.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, label: "Protected team access" },
              { icon: Sparkles, label: "Role-aware workspace setup" },
              { icon: ArrowRight, label: "Fast project onboarding" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-focus)]/10 text-[var(--accent-focus)]">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              appearance={authAppearance}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
