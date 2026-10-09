import { auth } from "@clerk/nextjs/server";
import { isProjectId } from "@/lib/projects";
import { normalizeProjectName } from "@/lib/project-name";
import { prisma } from "@/lib/prisma";
import { NODE_COLORS, NODE_SHAPES } from "@/types/canvas";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

const MAX_CANVAS_REQUEST_BYTES = 1_000_000;
const MAX_CANVAS_NODES = 500;
const MAX_CANVAS_EDGES = 1_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCanvasNode(value: unknown): value is Record<string, unknown> {
  if (
    !isRecord(value) ||
    (value.type !== "block" && value.type !== "microservice") ||
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    !isRecord(value.position) ||
    typeof value.position.x !== "number" ||
    !Number.isFinite(value.position.x) ||
    typeof value.position.y !== "number" ||
    !Number.isFinite(value.position.y) ||
    !isRecord(value.data)
  ) {
    return false;
  }

  const name =
    typeof value.data.name === "string"
      ? value.data.name
      : value.data.label;
  if (typeof name !== "string" || name.length > 40) {
    return false;
  }

  const properties = value.data.elementProperties;
  if (properties === undefined) {
    return true;
  }

  return (
    isRecord(properties) &&
    typeof properties.backgroundColor === "string" &&
    typeof properties.textColor === "string" &&
    NODE_COLORS.some(
      (color) =>
        color.background === properties.backgroundColor &&
        color.text === properties.textColor,
    ) &&
    NODE_SHAPES.some((shape) => shape === properties.layoutType)
  );
}

function isCanvasEdge(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.source === "string" &&
    typeof value.target === "string"
  );
}

function isCanvasNodeArray(
  value: unknown,
): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isCanvasNode);
}

function isCanvasEdgeArray(
  value: unknown,
): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isCanvasEdge);
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  if (!isProjectId(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_CANVAS_REQUEST_BYTES) {
      return Response.json({ error: "Request body is too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const hasName = Object.prototype.hasOwnProperty.call(payload, "name");
  const hasCanvasNodes = Object.prototype.hasOwnProperty.call(
    payload,
    "canvasNodes",
  );
  const hasCanvasEdges = Object.prototype.hasOwnProperty.call(
    payload,
    "canvasEdges",
  );

  if (!hasName && !hasCanvasNodes && !hasCanvasEdges) {
    return Response.json({ error: "No project fields were provided" }, { status: 400 });
  }

  if (hasCanvasNodes !== hasCanvasEdges) {
    return Response.json(
      { error: "Canvas nodes and edges must be provided together" },
      { status: 400 },
    );
  }

  if (hasCanvasNodes && hasCanvasEdges) {
    if (!Array.isArray(payload.canvasNodes) || !Array.isArray(payload.canvasEdges)) {
      return Response.json(
        { error: "Canvas nodes and edges must be arrays" },
        { status: 400 },
      );
    }
    if (
      payload.canvasNodes.length > MAX_CANVAS_NODES ||
      payload.canvasEdges.length > MAX_CANVAS_EDGES
    ) {
      return Response.json(
        { error: "Canvas exceeds the maximum node or edge count" },
        { status: 400 },
      );
    }
    if (
      !isCanvasNodeArray(payload.canvasNodes) ||
      !isCanvasEdgeArray(payload.canvasEdges)
    ) {
      return Response.json(
        { error: "Canvas contains malformed nodes or edges" },
        { status: 400 },
      );
    }

    const nodeIds = new Set(payload.canvasNodes.map((node) => node.id));
    if (nodeIds.size !== payload.canvasNodes.length) {
      return Response.json(
        { error: "Canvas node IDs must be unique" },
        { status: 400 },
      );
    }
    const edgeIds = new Set(payload.canvasEdges.map((edge) => edge.id));
    if (edgeIds.size !== payload.canvasEdges.length) {
      return Response.json(
        { error: "Canvas edge IDs must be unique" },
        { status: 400 },
      );
    }
    if (
      !payload.canvasEdges.every(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
      )
    ) {
      return Response.json(
        { error: "Canvas edges must reference existing nodes" },
        { status: 400 },
      );
    }
  }

  let name: string | undefined;
  if (hasName) {
    if (typeof payload.name !== "string") {
      return Response.json(
        { error: "A project name must be a string" },
        { status: 400 },
      );
    }

    const normalizedName = normalizeProjectName(payload.name);
    if (!normalizedName) {
      return Response.json(
        { error: "Project names must include at least one letter or number." },
        { status: 400 },
      );
    }
    name = normalizedName;
  }

  let canvasBlobUrl: string | undefined;
  if (hasCanvasNodes && hasCanvasEdges) {
    canvasBlobUrl = JSON.stringify({
      canvasNodes: payload.canvasNodes,
      canvasEdges: payload.canvasEdges,
    });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId, ownerId: userId },
    data: {
      ...(name === undefined ? {} : { name }),
      ...(canvasBlobUrl === undefined ? {} : { canvasBlobUrl }),
    },
  });

  return Response.json(updatedProject);
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  if (!isProjectId(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({
    where: { id: projectId, ownerId: userId },
  });

  return new Response(null, { status: 204 });
}
