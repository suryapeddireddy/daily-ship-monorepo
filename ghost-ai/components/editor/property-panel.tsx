"use client";

import { Trash2, X } from "lucide-react";
import type { CanvasNode, CanvasNodeData } from "@/hooks/useCanvasSync";
import {
  NODE_COLORS,
  NODE_SHAPES,
  type NodeElementProperties,
} from "@/types/canvas";

interface PropertyPanelProps {
  node: CanvasNode | null;
  onClose: () => void;
  onNodeUpdate: (nodeId: string, update: Partial<CanvasNodeData>) => void;
  onElementPropertiesChange: (nodeId: string, update: Partial<NodeElementProperties>) => void;
  onNodeDelete: (nodeId: string) => void;
}

export function PropertyPanel({
  node,
  onClose,
  onNodeUpdate,
  onElementPropertiesChange,
  onNodeDelete,
}: PropertyPanelProps) {
  const elementProperties = node?.data.elementProperties;

  return (
    <aside
      aria-label="Node properties"
      aria-hidden={!node}
      inert={!node}
      className={`absolute bottom-4 right-4 top-4 z-20 flex w-[min(22rem,calc(100%-2rem))] flex-col overflow-y-auto rounded-2xl border border-white/[0.08] bg-[var(--panel)] p-5 shadow-2xl shadow-black/40 transition-transform duration-200 ease-out ${
        node ? "translate-x-0" : "pointer-events-none translate-x-[calc(100%+1rem)]"
      }`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Node settings
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
            Customize block
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close node properties"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {node ? (
        <div className="flex flex-1 flex-col gap-6">
          <label className="block space-y-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Name
            </span>
            <input
              value={node.data.name}
              maxLength={40}
              onChange={(event) =>
                onNodeUpdate(node.id, { name: event.currentTarget.value })
              }
              className="h-10 w-full rounded-lg border border-white/[0.1] bg-background px-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--accent-focus)] focus:ring-2 focus:ring-[var(--accent-focus)]/20"
              aria-label="Node name"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Node Shape
            </span>
            <select
              value={elementProperties?.layoutType ?? "rectangle"}
              onChange={(event) => {
                const layoutType = NODE_SHAPES.find(
                  (shape) => shape === event.currentTarget.value,
                );
                if (layoutType) {
                  onElementPropertiesChange(node.id, { layoutType });
                }
              }}
              className="h-10 w-full rounded-lg border border-white/[0.1] bg-background px-3 text-sm capitalize text-[var(--text-primary)] outline-none focus:border-[var(--accent-focus)] focus:ring-2 focus:ring-[var(--accent-focus)]/20"
              aria-label="Node Shape"
            >
              {NODE_SHAPES.map((shape) => (
                <option key={shape} value={shape}>
                  {shape}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium text-[var(--text-secondary)]">
              Background color
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {NODE_COLORS.map((color) => {
                const activeBackground =
                  elementProperties?.backgroundColor ?? NODE_COLORS[0].background;
                const selected = activeBackground === color.background;
                return (
                  <button
                    key={color.name}
                    type="button"
                    title={color.name}
                    aria-label={`${color.name} block color`}
                    aria-pressed={selected}
                    onClick={() =>
                      onElementPropertiesChange(node.id, {
                        backgroundColor: color.background,
                        textColor: color.text,
                      })
                    }
                    className={`flex h-10 items-center justify-center rounded-lg border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] ${
                      selected
                        ? "border-[var(--accent-focus)] ring-1 ring-[var(--accent-focus)]"
                        : "border-white/[0.12]"
                    }`}
                    style={{ backgroundColor: color.background }}
                  >
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: color.text }}
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-auto border-t border-white/[0.08] pt-5">
            <button
              type="button"
              onClick={() => onNodeDelete(node.id)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-sm font-medium text-rose-400 transition-colors hover:border-rose-500/50 hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Delete Node
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
