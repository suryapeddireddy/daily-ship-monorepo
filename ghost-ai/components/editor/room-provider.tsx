"use client";

import type { ReactNode } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider as LiveblocksRoomProvider,
} from "@liveblocks/react/suspense";

interface RoomProviderProps {
  children: ReactNode;
  projectId: string;
}

export function RoomProvider({ children, projectId }: RoomProviderProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <LiveblocksRoomProvider
        id={projectId}
        initialPresence={{ cursor: null }}
        initialStorage={{
          canvasNodes: [],
          canvasEdges: [],
          initialized: false,
        }}
      >
        <ClientSideSuspense
          fallback={
            <main className="flex min-h-screen items-center justify-center bg-background px-6">
              <p className="text-sm text-muted-foreground">
                Connecting to Liveblocks session space...
              </p>
            </main>
          }
        >
          {() => children}
        </ClientSideSuspense>
      </LiveblocksRoomProvider>
    </LiveblocksProvider>
  );
}
