"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
  projectName: string | null;
}

export function EditorNavbar({
  isSidebarOpen,
  onMenuClick,
  projectName,
}: EditorNavbarProps) {
  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4">
      <div className="flex flex-1 items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          aria-expanded={isSidebarOpen}
          onClick={onMenuClick}
        >
          <Menu aria-hidden="true" />
        </Button>
      </div>

      <div className="flex flex-1 justify-center">
        <h1 className="truncate text-sm font-medium tracking-tight text-[var(--text-primary)]">
          {projectName ?? "Untitled System"}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled>
          <Share2 aria-hidden="true" />
          Share
        </Button>
        <UserButton
          appearance={{
            elements: {
              userButtonTrigger:
                "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)] hover:bg-[var(--background)]",
              userButtonPopoverCard:
                "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)] shadow-none",
              userButtonPopoverActionButton:
                "text-[var(--text-primary)] hover:bg-[var(--background)]",
              userButtonPopoverActionButtonText: "text-[var(--text-primary)]",
              userButtonPopoverFooter:
                "border-t border-[var(--border)] bg-[var(--background)]",
            },
          }}
        />
      </div>
    </header>
  );
}
