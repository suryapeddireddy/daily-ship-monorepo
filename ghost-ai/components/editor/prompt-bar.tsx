"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Edge } from "@xyflow/react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import type { CanvasNode } from "@/hooks/useCanvasSync";
import { getLayoutedElements } from "@/lib/layout";
import { NODE_SHAPES } from "@/types/canvas";

interface PromptBarProps {
  projectId: string;
  nodes: CanvasNode[];
  edges: Edge[];
  setNodes: Dispatch<SetStateAction<CanvasNode[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
}

const STATUS_POLL_INTERVAL_MS = 1_500;
const STATUS_POLL_TIMEOUT_MS = 20_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCanvasNode(value: unknown): value is CanvasNode {
  if (
    !isRecord(value) ||
    value.type !== "block" ||
    typeof value.id !== "string" ||
    !isRecord(value.position) ||
    typeof value.position.x !== "number" ||
    !Number.isFinite(value.position.x) ||
    typeof value.position.y !== "number" ||
    !Number.isFinite(value.position.y) ||
    !isRecord(value.data)
  ) {
    return false;
  }

  const data = value.data;
  if (
    typeof data.name !== "string" ||
    data.name.length === 0 ||
    data.name.length > 40 ||
    !isRecord(data.elementProperties) ||
    typeof data.elementProperties.backgroundColor !== "string" ||
    typeof data.elementProperties.textColor !== "string"
  ) {
    return false;
  }

  const properties = data.elementProperties;
  return NODE_SHAPES.some(
    (shape) => shape === properties.layoutType,
  );
}

function isCanvasEdge(value: unknown): value is Edge {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.source === "string" &&
    typeof value.target === "string" &&
    value.animated === true
  );
}

function waitForExecutionUpdate(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timeoutId);
      signal.removeEventListener("abort", onAbort);
      reject(new Error("Blueprint status polling timed out."));
    };

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, STATUS_POLL_INTERVAL_MS);
    signal.addEventListener("abort", onAbort, { once: true });

    if (signal.aborted) {
      onAbort();
    }
  });
}

export function PromptBar({
  projectId,
  nodes,
  edges,
  setNodes,
  setEdges,
}: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationActive = useRef(false);
  const canvasRef = useRef({ nodes, edges });
  useEffect(() => {
    canvasRef.current = { nodes, edges };
  }, [edges, nodes]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (generationActive.current || !trimmedPrompt) {
      return;
    }

    generationActive.current = true;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          prompt: trimmedPrompt,
          canvas: {
            nodes: nodes.map((node) => ({
              id: node.id,
              label: node.data.name,
              x: node.position.x,
              y: node.position.y,
            })),
            edges: edges.map((edge) => ({
              source: edge.source,
              target: edge.target,
            })),
          },
        }),
      });
      const triggerResponse: unknown = await response.json();

      if (!response.ok) {
        const message =
          isRecord(triggerResponse) && typeof triggerResponse.error === "string"
            ? triggerResponse.error
            : "Blueprint generation failed.";
        throw new Error(message);
      }

      if (
        !isRecord(triggerResponse) ||
        typeof triggerResponse.runId !== "string"
      ) {
        throw new Error("Blueprint execution was not created.");
      }

      let output: unknown;
      const pollingController = new AbortController();
      const pollingTimeoutId = window.setTimeout(
        () => pollingController.abort(),
        STATUS_POLL_TIMEOUT_MS,
      );
      try {
        while (true) {
          await waitForExecutionUpdate(pollingController.signal);
          const statusResponse = await fetch(
            `/api/generate-blueprint?runId=${encodeURIComponent(triggerResponse.runId)}`,
            { cache: "no-store", signal: pollingController.signal },
          );
          const statusResult: unknown = await statusResponse.json();
          if (!statusResponse.ok) {
            const message =
              isRecord(statusResult) && typeof statusResult.error === "string"
                ? statusResult.error
                : "Blueprint generation failed.";
            throw new Error(message);
          }
          if (
            !isRecord(statusResult) ||
            typeof statusResult.status !== "string"
          ) {
            throw new Error("Blueprint execution returned an invalid status.");
          }
          if (
            statusResult.status === "COMPLETED" ||
            statusResult.status === "SUCCESS"
          ) {
            output = statusResult.output;
            break;
          }
        }
      } catch (pollingError) {
        if (pollingController.signal.aborted) {
          throw new Error(
            "Blueprint generation is still pending after 20 seconds. Please try again.",
          );
        }
        throw pollingError;
      } finally {
        window.clearTimeout(pollingTimeoutId);
      }

      if (
        !isRecord(output) ||
        !Array.isArray(output.nodes) ||
        !Array.isArray(output.edges) ||
        !output.nodes.every(isCanvasNode) ||
        !output.edges.every(isCanvasEdge)
      ) {
        throw new Error("Generated blueprint had an invalid format.");
      }

      const generatedNodes = output.nodes;
      const generatedEdges = output.edges;
      const currentCanvas = canvasRef.current;
      const availableNodeIds = new Set([
        ...currentCanvas.nodes.map((node) => node.id),
        ...generatedNodes.map((node) => node.id),
      ]);
      if (
        !generatedEdges.every(
          (edge) =>
            availableNodeIds.has(edge.source) &&
            availableNodeIds.has(edge.target),
        )
      ) {
        throw new Error("Gemini returned links to unknown nodes. Please try again.");
      }

      const layouted = getLayoutedElements(
        [...currentCanvas.nodes, ...generatedNodes],
        [...currentCanvas.edges, ...generatedEdges],
      );
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setPrompt("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Blueprint generation failed. Please try again.",
      );
    } finally {
      generationActive.current = false;
      setIsGenerating(false);
    }
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-5 z-30 w-[min(42rem,calc(100%-2.5rem))] -translate-x-1/2">
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-[var(--panel)]/95 p-2 pl-4 shadow-xl shadow-black/30 backdrop-blur"
      >
        {isGenerating ? (
          <LoaderCircle
            aria-hidden="true"
            className="h-5 w-5 shrink-0 animate-spin text-[var(--accent-focus)]"
          />
        ) : (
          <Sparkles
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-[var(--accent-focus)]"
          />
        )}
        <input
          value={prompt}
          maxLength={2000}
          onChange={(event) => setPrompt(event.currentTarget.value)}
          placeholder="Describe the system you want to design..."
          aria-label="Describe an architecture to generate"
          aria-describedby={error ? "blueprint-generation-error" : undefined}
          disabled={isGenerating}
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[var(--accent-focus)] px-4 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--panel)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <span>Designing</span>
          ) : (
            <>
              <span>Generate</span>
              <Send aria-hidden="true" className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      <p
        id="blueprint-generation-error"
        role="alert"
        aria-live="polite"
        className={`mt-2 text-center text-xs text-rose-400 ${error ? "" : "sr-only"}`}
      >
        {error}
      </p>
    </div>
  );
}
