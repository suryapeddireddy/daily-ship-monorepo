import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";

export default function HomePortal() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F19] text-[#F8FAFC] p-6 text-center bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
        <Terminal className="h-6 w-6 text-[#3B82F6]" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Ghost AI Workspace Portal</h1>
      <p className="text-sm text-[#94A3B8] max-w-sm mb-6">Enter your active systems engineering pipeline canvas directly via the deployment terminal link.</p>
      <Link 
        href="/editor/sandbox-project" 
        className="flex items-center gap-1.5 rounded-md bg-[#3B82F6] px-4 py-2 text-xs font-medium text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
      >
        Open Architecture Canvas
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
