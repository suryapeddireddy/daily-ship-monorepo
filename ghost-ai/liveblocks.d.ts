import type {
  SharedCanvasEdge,
  SharedCanvasNode,
} from "@/hooks/useCanvasSync";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
    };
    Storage: {
      canvasNodes: SharedCanvasNode[];
      canvasEdges: SharedCanvasEdge[];
      initialized: boolean;
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        color: string;
        collaboratorId?: string;
        avatar?: string;
      };
    };
  }
}

export {};
