"use client";

import { useEffect, useRef, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import {
  NODE_COLORS,
  NODE_SHAPES,
  type NodeElementProperties,
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

export function useCanvasSync(
  projectId: string,
  nodes: Node[],
  edges: Edge[],
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
  }, [edges, nodes, projectId]);

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
