"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close project sidebar"
          className="fixed inset-0 top-14 z-30 cursor-default bg-background/60"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Project workspaces"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed bottom-0 left-0 top-14 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-[var(--panel)] transition-transform duration-200 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Workspaces
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close project sidebar"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <Tabs
          defaultValue="my-systems"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList className="mx-3 mt-3 w-auto">
            <TabsTrigger value="my-systems">My Systems</TabsTrigger>
            <TabsTrigger value="shared-workspaces">Shared Workspaces</TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-systems"
            className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-4"
          >
            <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              No systems yet
            </p>
            <Button type="button" className="w-full">
              <Plus aria-hidden="true" />
              Create Project
            </Button>
          </TabsContent>

          <TabsContent
            value="shared-workspaces"
            className="px-4 py-6 text-sm text-muted-foreground"
          >
            Shared workspaces will appear here.
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
