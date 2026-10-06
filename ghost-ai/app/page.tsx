import { ArrowRight, Layers, Layout, Users2, Database, Terminal } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F19] text-[#F8FAFC] font-sans antialiased selection:bg-blue-500/30">
      
      {/* 🧭 Mock Editor Top Navbar */}
      <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#121826] px-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-[#3B82F6]" />
          <span className="font-semibold tracking-tight text-[#F8FAFC]">Ghost AI</span>
          <span className="rounded-sm bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-[#94A3B8] border border-white/[0.04]">v1.0-alpha</span>
        </div>
        
        {/* Right side options menu slot */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Synced
          </div>
          <button className="rounded-md bg-[#3B82F6] px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-blue-500/10 hover:bg-blue-600 transition-colors">
            Share
          </button>
        </div>
      </header>

      {/* 🖥️ Main Workspace Split Window Panel Grid */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 🗂️ Left Project Sidebar Frame Placeholder */}
        <aside className="hidden w-64 flex-col border-r border-white/[0.06] bg-[#121826] p-4 md:flex">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Workspaces
          </div>
          <div className="space-y-1">
            <button className="flex w-full items-center gap-2.5 rounded-md bg-white/[0.04] px-3 py-2 text-sm font-medium text-[#F8FAFC] border border-white/[0.04]">
              <Layout className="h-4 w-4 text-[#3B82F6]" />
              E-Commerce Platform
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-[#94A3B8] hover:bg-white/[0.02] hover:text-[#F8FAFC] transition-colors">
              <Layers className="h-4 w-4" />
              Realtime Chat System
            </button>
          </div>
        </aside>

        {/* 🎨 Center Canvas Editor Grid Plane */}
        <main className="relative flex flex-1 flex-col items-center justify-center p-8 bg-[#0B0F19] bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px]">
          
          {/* Centered Sandbox Panel Core */}
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[#F8FAFC] mb-2">
              System Workspace
            </h1>
            <p className="text-sm text-[#94A3B8] mb-6">
              Your architectural canvas is clean and ready. Open up a dynamic workflow blueprint or trigger an AI generation file path.
            </p>
            
            {/* Primitives Testing Action Grid Blocks */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="group rounded-md border border-white/[0.06] bg-[#121826] p-3 hover:border-[#3B82F6]/50 transition-all cursor-pointer">
                <div className="mb-1 text-xs font-medium text-[#F8FAFC] flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-emerald-500" /> PostgreSQL DB Node
                </div>
                <div className="text-[11px] text-[#94A3B8]">Validates custom primitive model structures.</div>
              </div>

              <div className="group rounded-md border border-white/[0.06] bg-[#121826] p-3 hover:border-[#3B82F6]/50 transition-all cursor-pointer">
                <div className="mb-1 text-xs font-medium text-[#F8FAFC] flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5 text-blue-400" /> Collaboration Group
                </div>
                <div className="text-[11px] text-[#94A3B8]">Tests token access overlay structures.</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs font-medium text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC] transition-all group">
                Enter Fullscreen Architecture View
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
