"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export function EditorWorkspace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function toggleSidebar() {
    setIsSidebarOpen((open) => !open);
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onMenuClick={toggleSidebar}
      />
      <main className="relative min-h-0 flex-1" aria-label="Editor workspace" />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
