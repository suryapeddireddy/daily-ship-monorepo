"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type NodeProps,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react";
import { Boxes, Plus, Settings } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { PropertyPanel } from "@/components/editor/property-panel";
import {
  parseCanvasSnapshot,
  useCanvasSync,
  type CanvasNode,
  type CanvasNodeData,
} from "@/hooks/useCanvasSync";
import {
  NODE_COLORS,
  NODE_SHAPES,
  type NodeElementProperties,
  type NodeLayoutType,
} from "@/types/canvas";

interface WorkspaceCanvasProps {
  projectId: string;
  projectName: string;
  initialCanvasBlobUrl: string | null;
}

function CanvasBlock({
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const elementProperties = data.elementProperties ?? {
    backgroundColor: NODE_COLORS[0].background,
    textColor: NODE_COLORS[0].text,
    layoutType: "rectangle" as const,
  };
  const layoutStyle = getNodeLayoutStyle(elementProperties.layoutType);

  return (
    <div className="group relative w-auto max-w-[320px]">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-[var(--background)] !bg-[var(--accent-focus)]"
      />
      <div
        className={`flex min-h-[80px] min-w-[160px] max-w-[320px] w-auto h-auto items-center justify-center border p-4 text-wrap break-words shadow-xl shadow-black/25 ${
          selected ? "ring-1 ring-[var(--accent-focus)]" : ""
        }`}
        style={{
          ...layoutStyle,
          backgroundColor: elementProperties.backgroundColor,
          borderColor: elementProperties.textColor,
          color: elementProperties.textColor,
        }}
      >
        <p className="min-w-0 max-w-full break-words text-sm font-medium">
          {data.name}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Open settings for ${data.name}`}
        title="Node settings"
        data-node-settings
        className="nodrag nopan absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-[var(--panel)] text-[var(--text-secondary)] opacity-0 shadow-md transition-opacity hover:border-[var(--accent-focus)] hover:text-[var(--text-primary)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] group-hover:opacity-100"
      >
        <Settings aria-hidden="true" className="h-4 w-4" />
      </button>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-[var(--background)] !bg-[var(--accent-focus)]"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  block: CanvasBlock,
};

function getNodeLayoutStyle(layoutType: NodeLayoutType): CSSProperties {
  switch (layoutType) {
    case "circle":
      return {
        borderRadius: "9999px",
        aspectRatio: "1 / 1",
      };
    case "rounded-square":
      return {
        borderRadius: "1.5rem",
        aspectRatio: "1 / 1",
      };
    case "diamond":
      return {
        aspectRatio: "1 / 1",
        clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
      };
    case "rectangle":
      return { borderRadius: "0.75rem" };
  }
}

function CanvasContents({
  projectId,
  projectName,
  initialCanvasBlobUrl,
}: WorkspaceCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const initialCanvas = useMemo(
    () => parseCanvasSnapshot(initialCanvasBlobUrl),
    [initialCanvasBlobUrl],
  );
  const [nodes, setNodes, onNodesChange] =
    useNodesState<CanvasNode>(initialCanvas?.canvasNodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialCanvas?.canvasEdges ?? [],
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { screenToFlowPosition, deleteElements } = useReactFlow<CanvasNode, Edge>();
  const sync = useCanvasSync(projectId, nodes, edges);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;

  const handleNodeClick: NodeMouseHandler<CanvasNode> = useCallback(
    (event, node) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-node-settings]")
      ) {
        setSelectedNodeId(node.id);
      }
    },
    [],
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, update: Partial<CanvasNodeData>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...update,
                  ...(update.elementProperties
                    ? {
                        elementProperties: {
                          ...node.data.elementProperties,
                          ...update.elementProperties,
                        },
                      }
                    : {}),
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const handleElementPropertiesChange = useCallback(
    (nodeId: string, elementProperties: Partial<NodeElementProperties>) => {
      const currentNode = nodes.find((node) => node.id === nodeId);
      if (!currentNode) {
        return;
      }
      handleNodeUpdate(nodeId, {
        elementProperties: {
          backgroundColor:
            currentNode.data.elementProperties?.backgroundColor ??
            NODE_COLORS[0].background,
          textColor:
            currentNode.data.elementProperties?.textColor ?? NODE_COLORS[0].text,
          layoutType: currentNode.data.elementProperties?.layoutType ?? "rectangle",
          ...elementProperties,
        },
      });
    },
    [handleNodeUpdate, nodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge({ ...connection, type: "smoothstep" }, currentEdges),
      );
    },
    [setEdges],
  );

  const handleAddNode = useCallback(
    () => {
      const bounds = canvasRef.current
        ?.querySelector(".react-flow")
        ?.getBoundingClientRect();
      if (!bounds) {
        return;
      }

      const layoutType =
        NODE_SHAPES[Math.floor(Math.random() * NODE_SHAPES.length)] ??
        "rectangle";
      const position = screenToFlowPosition({
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      });

      setNodes((currentNodes) => [
        ...currentNodes,
        {
          id: crypto.randomUUID(),
          type: "block",
          position,
          data: {
            name: "Untitled Block",
            elementProperties: {
              backgroundColor: NODE_COLORS[0].background,
              textColor: NODE_COLORS[0].text,
              layoutType,
            },
          },
        },
      ]);
    },
    [screenToFlowPosition, setNodes],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      void deleteElements({ nodes: [{ id: nodeId }] });
      setSelectedNodeId((selectedId) =>
        selectedId === nodeId ? null : selectedId,
      );
    },
    [deleteElements],
  );

  return (
    <section
      ref={canvasRef}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      aria-label={`${projectName} architecture canvas`}
    >
      <div className="pointer-events-none absolute left-5 top-5 z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[var(--panel)] text-[var(--accent-focus)]">
            <Boxes aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">{projectName}</h2>
            <p className="text-xs text-muted-foreground">
              System architecture ·{" "}
              <span
                role="status"
                aria-live="polite"
                title={sync.error ?? undefined}
                className={sync.status === "error" ? "text-rose-400" : ""}
              >
                {sync.status === "saving"
                  ? "Saving…"
                  : sync.status === "error"
                    ? "Save failed"
                    : "Saved"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.8}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="rgba(148, 163, 184, 0.18)"
        />
        <Controls
          position="bottom-right"
          className="!mb-5 !mr-5 !overflow-hidden !rounded-lg !border !border-white/[0.08] !bg-[var(--panel)] !shadow-lg"
        />
        <MiniMap
          position="top-right"
          pannable
          zoomable
          className="!mt-5 !mr-5 !overflow-hidden !rounded-lg !border !border-white/[0.08] !bg-[var(--panel)]"
          maskColor="rgba(11, 15, 25, 0.72)"
          nodeColor={(node) => {
            const nodeData = node.data as CanvasNodeData;
            return (
              nodeData.elementProperties?.backgroundColor ??
              NODE_COLORS[0].background
            );
          }}
        />
      </ReactFlow>

      <PropertyPanel
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onNodeUpdate={handleNodeUpdate}
        onElementPropertiesChange={handleElementPropertiesChange}
        onNodeDelete={handleDeleteNode}
      />

      <div className="pointer-events-auto absolute bottom-5 left-5 z-10 flex max-w-[calc(100%-2.5rem)] flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[var(--panel)]/95 p-2 shadow-xl backdrop-blur">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.06] bg-background px-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-focus)]/50 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
          onClick={handleAddNode}
        >
          <Plus aria-hidden="true" className="h-3.5 w-3.5 text-[var(--accent-focus)]" />
          <span>Add Block</span>
        </button>
      </div>
    </section>
  );
}

export function WorkspaceCanvas(props: WorkspaceCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContents {...props} />
    </ReactFlowProvider>
  );
}
