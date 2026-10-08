"use client";

import type { ReactNode } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";

interface EditorProvidersProps {
  children: ReactNode;
  roomId: string;
}

export function EditorProviders({ children, roomId }: EditorProvidersProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId}>
        <ClientSideSuspense
          fallback={
            <main className="flex min-h-screen items-center justify-center bg-background px-6">
              <p className="text-sm text-muted-foreground">
                Connecting to live session space...
              </p>
            </main>
          }
        >
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
