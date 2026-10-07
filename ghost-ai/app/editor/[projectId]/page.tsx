"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  Network, 
  Cpu, 
  Database, 
  HelpCircle, 
  Play, 
  Settings, 
  Terminal, 
  Code,
  Sparkles
} from "lucide-react";

// Import your newly created Spec 02 primitives cleanly
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export default function EditorWorkspaceDemo() {
  const params = useParams();
  const projectId = params?.projectId as string || "test-project-123";
  
  // Local state coordination for Spec 02 toggle interactions
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#0B0F19] text-[#F8FAFC] font-sans antialiased overflow-hidden select-none">
      
      {/* 🧭 Persistent Fixed Top Navigation Bar */}
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((current) => !current)}
      />

      {/* 🖥️ Main System Design Application Body Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        
        {/* 🗂️ Absolute Slide-Over Project Sidebar Panel */}
        <ProjectSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 🎨 System Architecture Interactive Canvas Plane */}
        <main className="relative flex flex-1 flex-col items-center justify-center p-6 bg-[#0B0F19] bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px]">
          
          {/* Floating Canvas Meta Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-md border border-white/[0.06] bg-[#121826]/80 px-3 py-1.5 text-xs font-medium text-[#94A3B8] backdrop-blur-md">
            <Network className="h-3.5 w-3.5 text-[#3B82F6]" />
            <span>Active Pipeline Canvas:</span>
            <span className="font-mono text-[#F8FAFC]">{projectId}</span>
          </div>

          {/* Centered Demonstration Node Interface */}
          <div className="relative max-w-xl text-center z-0">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
              <Cpu className="h-6 w-6 text-[#3B82F6]" />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC] mb-2">
              Spec 02 Infrastructure Verified
            </h1>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto mb-8">
              The layout frame layout is fully active. Test the absolute depth stacking behavior by opening up the project list drawer menu.
            </p>

            {/* Test Operations Control Console Grid */}
            <div className="grid grid-cols-3 gap-3 text-left">
              
              <div 
                onClick={() => setSidebarOpen(true)}
                className="group relative rounded-md border border-white/[0.06] bg-[#121826] p-4 hover:border-[#3B82F6]/40 transition-all cursor-pointer shadow-xl"
              >
                <div className="mb-1 text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[#3B82F6]" /> Trigger Sidebar
                </div>
                <div className="text-[11px] text-[#94A3B8]">Launches the absolute floating list view drawer.</div>
              </div>

              <div className="group relative rounded-md border border-white/[0.06] bg-[#121826] p-4 hover:border-emerald-500/30 transition-all cursor-not-allowed opacity-50 shadow-xl">
                <div className="mb-1 text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-emerald-400" /> Database Link
                </div>
                <div className="text-[11px] text-[#94A3B8]">Requires Prisma models mapping from Spec 03.</div>
              </div>

              <div className="group relative rounded-md border border-white/[0.06] bg-[#121826] p-4 hover:border-amber-500/30 transition-all cursor-not-allowed opacity-50 shadow-xl">
                <div className="mb-1 text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Liveblocks Sync
                </div>
                <div className="text-[11px] text-[#94A3B8]">Websocket multiplayer activates inside Phase 4.</div>
              </div>

            </div>

            {/* Quick Helper Hotkey Tip */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#475569]">
              <Code className="h-3.5 w-3.5" />
              <span>Click the upper left menu toggle button to overlay workspace lists cleanly.</span>
            </div>
          </div>

          {/* Lower Quick Utility Floating Dock Layout */}
          <div className="absolute bottom-6 flex items-center gap-1 rounded-full border border-white/[0.06] bg-[#121826]/90 p-1.5 shadow-2xl backdrop-blur-md">
            <button className="rounded-full bg-white/[0.04] p-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"><Settings className="h-4 w-4" /></button>
            <div className="h-4 w-px bg-white/[0.06]"></div>
            <button className="flex items-center gap-1 rounded-full bg-[#3B82F6] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
              <Play className="h-3 w-3 fill-current" /> Compile Framework
            </button>
            <div className="h-4 w-px bg-white/[0.06]"></div>
            <button className="rounded-full bg-white/[0.04] p-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"><HelpCircle className="h-4 w-4" /></button>
          </div>

        </main>
      </div>
    </div>
  );
}
