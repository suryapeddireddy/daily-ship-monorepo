"use client";

import { Menu, Share2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onMenuClick,
}: EditorNavbarProps) {
  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[var(--panel)] px-4">
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
          Untitled System
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled>
          <Share2 aria-hidden="true" />
          Share
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="User settings"
          disabled
        >
          <UserRound aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
