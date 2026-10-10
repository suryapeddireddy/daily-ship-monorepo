"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Edge, Node } from "@xyflow/react";
import { useMutation, useStorage } from "@liveblocks/react/suspense";
import {
  NODE_COLORS,
  NODE_SHAPES,
  type NodeElementProperties,
  type NodeLayoutType,
} from "@/types/canvas";

export interface CanvasNodeData extends Record<string, unknown> {
  name: string;
  elementProperties?: NodeElementProperties;
}

export type CanvasNode = Node<CanvasNodeData, "block">;

export interface CanvasSnapshot {
  canvasNodes: CanvasNode[];
  canvasEdges: Edge[];
}

export type SharedCanvasNode = {
  id: string;
  type: "block";
  position: { x: number; y: number };
  data: {
    name: string;
    elementProperties: {
      backgroundColor: string;
      textColor: string;
      layoutType: NodeLayoutType;
    };
  };
};

export type SharedCanvasEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
  type: string;
};

type CanvasSyncStatus = "saved" | "saving" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCanvasNode(value: unknown): CanvasNode | null {
  if (
    !isRecord(value) ||
    (value.type !== "block" && value.type !== "microservice") ||
    typeof value.id !== "string" ||
    !isRecord(value.position) ||
    typeof value.position.x !== "number" ||
    !Number.isFinite(value.position.x) ||
    typeof value.position.y !== "number" ||
    !Number.isFinite(value.position.y) ||
    !isRecord(value.data)
  ) {
    return null;
  }

  const name =
    typeof value.data.name === "string"
      ? value.data.name
      : typeof value.data.label === "string"
        ? value.data.label
        : null;
  if (name === null) {
    return null;
  }

  const rawProperties = value.data.elementProperties;
  const elementProperties: NodeElementProperties = {
    backgroundColor: NODE_COLORS[0].background,
    textColor: NODE_COLORS[0].text,
    layoutType: "rectangle" as const,
  };
  if (rawProperties !== undefined) {
    if (
      !isRecord(rawProperties) ||
      typeof rawProperties.backgroundColor !== "string" ||
      typeof rawProperties.textColor !== "string"
    ) {
      return null;
    }
    const color = NODE_COLORS.find(
      ({ background, text }) =>
        background === rawProperties.backgroundColor &&
        text === rawProperties.textColor,
    );
    if (!color) {
      return null;
    }
    const layoutType =
      NODE_SHAPES.find((shape) => shape === rawProperties.layoutType) ??
      "rectangle";
    elementProperties.backgroundColor = color.background;
    elementProperties.textColor = color.text;
    elementProperties.layoutType = layoutType;
  }

  return {
    id: value.id,
    type: "block",
    position: {
      x: value.position.x,
      y: value.position.y,
    },
    data: { name, elementProperties },
  };
}

function isCanvasNode(value: unknown): value is CanvasNode {
  return normalizeCanvasNode(value) !== null;
}

function isCanvasEdge(value: unknown): value is Edge {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.source === "string" &&
    typeof value.target === "string"
  );
}

export function parseCanvasSnapshot(value: string | null): CanvasSnapshot | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      !Array.isArray(parsed.canvasNodes) ||
      !Array.isArray(parsed.canvasEdges) ||
      !parsed.canvasNodes.every(isCanvasNode) ||
      !parsed.canvasEdges.every(isCanvasEdge)
    ) {
      return null;
    }

    const canvasNodes: CanvasNode[] = [];
    for (const node of parsed.canvasNodes) {
      const normalizedNode = normalizeCanvasNode(node);
      if (!normalizedNode) {
        return null;
      }
      canvasNodes.push(normalizedNode);
    }

    return {
      canvasNodes,
      canvasEdges: parsed.canvasEdges,
    };
  } catch {
    return null;
  }
}

function toSharedCanvasNode(node: CanvasNode): SharedCanvasNode {
  const elementProperties = node.data.elementProperties ?? {
    backgroundColor: NODE_COLORS[0].background,
    textColor: NODE_COLORS[0].text,
    layoutType: "rectangle" as const,
  };

  return {
    id: node.id,
    type: "block",
    position: { x: node.position.x, y: node.position.y },
    data: {
      name: node.data.name,
      elementProperties: {
        backgroundColor: elementProperties.backgroundColor,
        textColor: elementProperties.textColor,
        layoutType: elementProperties.layoutType,
      },
    },
  };
}

function toSharedCanvasEdge(edge: Edge): SharedCanvasEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
    type: edge.type ?? "smoothstep",
  };
}

function getCanvasSignature(nodes: CanvasNode[], edges: Edge[]): string {
  return JSON.stringify({
    canvasNodes: nodes.map(toSharedCanvasNode),
    canvasEdges: edges.map(toSharedCanvasEdge),
  });
}

function areNodesInitialized(nodes: CanvasNode[]): boolean {
  return nodes.every(
    (node) => node.measured !== undefined || node.width !== undefined,
  );
}

export function useLiveCanvasSync(
  nodes: CanvasNode[],
  setNodes: Dispatch<SetStateAction<CanvasNode[]>>,
  edges: Edge[],
  setEdges: Dispatch<SetStateAction<Edge[]>>,
): void {
  const sharedNodes = useStorage((root) => root.canvasNodes);
  const sharedEdges = useStorage((root) => root.canvasEdges);
  const initialized = useStorage((root) => root.initialized);
  const publishCanvas = useMutation(
    (
      { storage },
      canvasNodes: SharedCanvasNode[],
      canvasEdges: SharedCanvasEdge[],
    ) => {
      storage.set("canvasNodes", canvasNodes);
      storage.set("canvasEdges", canvasEdges);
      storage.set("initialized", true);
    },
    [],
  );
  const initializeCanvas = useMutation(
    (
      { storage },
      canvasNodes: SharedCanvasNode[],
      canvasEdges: SharedCanvasEdge[],
    ) => {
      if (storage.get("initialized")) {
        return;
      }
      storage.set("canvasNodes", canvasNodes);
      storage.set("canvasEdges", canvasEdges);
      storage.set("initialized", true);
    },
    [],
  );

  const currentLocalState = useRef({ nodes, edges });
  const lastLocalSignature = useRef(getCanvasSignature(nodes, edges));
  const pendingRemoteSignature = useRef<string | null>(null);

  useEffect(() => {
    currentLocalState.current = { nodes, edges };
  }, [edges, nodes]);

  useEffect(() => {
    if (initialized) {
      return;
    }

    const { nodes: currentNodes, edges: currentEdges } =
      currentLocalState.current;
    if (!areNodesInitialized(currentNodes)) {
      return;
    }

    initializeCanvas(
      currentNodes.map(toSharedCanvasNode),
      currentEdges.map(toSharedCanvasEdge),
    );
  }, [edges, initializeCanvas, initialized, nodes]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const snapshot = parseCanvasSnapshot(
      JSON.stringify({ canvasNodes: sharedNodes, canvasEdges: sharedEdges }),
    );
    if (!snapshot) {
      console.error("Liveblocks returned an invalid canvas snapshot.");
      return;
    }

    const remoteSignature = getCanvasSignature(
      snapshot.canvasNodes,
      snapshot.canvasEdges,
    );
    const localState = currentLocalState.current;
    const localSignature = getCanvasSignature(
      localState.nodes,
      localState.edges,
    );
    if (remoteSignature === localSignature) {
      pendingRemoteSignature.current = null;
      lastLocalSignature.current = localSignature;
      return;
    }

    pendingRemoteSignature.current = remoteSignature;
    setNodes(snapshot.canvasNodes);
    setEdges(snapshot.canvasEdges);
  }, [initialized, setEdges, setNodes, sharedEdges, sharedNodes]);

  useEffect(() => {
    const localSignature = getCanvasSignature(nodes, edges);

    if (!initialized) {
      lastLocalSignature.current = localSignature;
      return;
    }

    const pendingSignature = pendingRemoteSignature.current;
    if (pendingSignature !== null) {
      if (localSignature === pendingSignature) {
        pendingRemoteSignature.current = null;
        lastLocalSignature.current = localSignature;
      }
      return;
    }

    if (localSignature === lastLocalSignature.current) {
      return;
    }

    if (!areNodesInitialized(nodes)) {
      return;
    }

    lastLocalSignature.current = localSignature;
    publishCanvas(
      nodes.map(toSharedCanvasNode),
      edges.map(toSharedCanvasEdge),
    );
  }, [edges, initialized, nodes, publishCanvas]);
}

export function useCanvasSync(
  projectId: string,
  nodes: Node[],
  edges: Edge[],
  canPersist: boolean,
): { status: CanvasSyncStatus; error: string | null } {
  const pendingSave = useRef<{
    projectId: string;
    nodes: Node[];
    edges: Edge[];
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const previousState = useRef({ nodes, edges });
  const latestSave = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [status, setStatus] = useState<CanvasSyncStatus>("saved");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canPersist) {
      return;
    }

    if (
      previousState.current.nodes === nodes &&
      previousState.current.edges === edges
    ) {
      return;
    }

    previousState.current = { nodes, edges };
    const saveId = ++latestSave.current;
    setStatus("saving");
    setError(null);

    const timeoutId = setTimeout(() => {
      pendingSave.current = null;
      const save = saveQueue.current.then(async () => {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ canvasNodes: nodes, canvasEdges: edges }),
          },
        );

        if (!response.ok) {
          throw new Error(`Canvas sync failed (${response.status}).`);
        }

        if (saveId === latestSave.current) {
          setStatus("saved");
        }
      });

      saveQueue.current = save.catch((caughtError: unknown) => {
        if (saveId === latestSave.current) {
          setStatus("error");
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Canvas changes could not be saved.",
          );
        }
      });
    }, 800);
    pendingSave.current = { projectId, nodes, edges, timeoutId };

    return () => clearTimeout(timeoutId);
  }, [canPersist, edges, nodes, projectId]);

  useEffect(
    () => () => {
      const pending = pendingSave.current;
      if (!pending) {
        return;
      }

      clearTimeout(pending.timeoutId);
      pendingSave.current = null;
      void fetch(`/api/projects/${encodeURIComponent(pending.projectId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasNodes: pending.nodes,
          canvasEdges: pending.edges,
        }),
        keepalive: true,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Canvas sync failed (${response.status}).`);
          }
        })
        .catch((caughtError: unknown) => {
          console.error("Canvas sync failed during unmount.", caughtError);
        });
    },
    [],
  );

  return { status, error };
}
