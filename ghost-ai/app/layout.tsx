import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "@xyflow/react/dist/style.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI Workspace",
  description: "Secure systems engineering workspace with Clerk authentication.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
        <ClerkProvider
          appearance={{
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
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
