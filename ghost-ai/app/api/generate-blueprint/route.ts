import { auth, currentUser } from "@clerk/nextjs/server";
import { runs, tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import type {
  BlueprintCanvasContext,
  GenerateBlueprintPayload,
  generateBlueprintTask,
} from "@/trigger/generate-blueprint";
import { isProjectId } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 100_000;
const MAX_PROMPT_LENGTH = 2_000;
const GENERATE_BLUEPRINT_TASK_ID = "generate-blueprint";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCanvasContext(value: unknown): BlueprintCanvasContext | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges) ||
    value.nodes.length > 500 ||
    value.edges.length > 1_000
  ) {
    return null;
  }

  const nodes: BlueprintCanvasContext["nodes"] = [];
  for (const node of value.nodes) {
    if (
      !isRecord(node) ||
      typeof node.id !== "string" ||
      node.id.length === 0 ||
      node.id.length > 100 ||
      typeof node.label !== "string" ||
      node.label.length > 40 ||
      typeof node.x !== "number" ||
      !Number.isFinite(node.x) ||
      typeof node.y !== "number" ||
      !Number.isFinite(node.y)
    ) {
      return null;
    }
    nodes.push({ id: node.id, label: node.label, x: node.x, y: node.y });
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  if (nodeIds.size !== nodes.length) {
    return null;
  }

  const edges: BlueprintCanvasContext["edges"] = [];
  for (const edge of value.edges) {
    if (
      !isRecord(edge) ||
      typeof edge.source !== "string" ||
      typeof edge.target !== "string" ||
      !nodeIds.has(edge.source) ||
      !nodeIds.has(edge.target)
    ) {
      return null;
    }
    edges.push({ source: edge.source, target: edge.target });
  }

  return { nodes, edges };
}

async function canEditProject(projectId: string, userId: string) {
  const user = await currentUser();
  const verifiedEmails =
    user?.emailAddresses
      .filter(({ verification }) => verification?.status === "verified")
      .map(({ emailAddress }) => emailAddress) ?? [];
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      collaborators: {
        where: { email: { in: verifiedEmails, mode: "insensitive" } },
        select: { role: true },
        take: 1,
      },
    },
  });

  return Boolean(
    project &&
      (project.ownerId === userId ||
        project.collaborators.some(({ role }) => role === "ADMIN")),
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { error: "Request body is too large" },
        { status: 413 },
      );
    }
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof payload.projectId !== "string" || !isProjectId(payload.projectId)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (
    typeof payload.prompt !== "string" ||
    payload.prompt.trim().length === 0 ||
    payload.prompt.length > MAX_PROMPT_LENGTH
  ) {
    return NextResponse.json(
      { error: `Prompt must contain 1 to ${MAX_PROMPT_LENGTH} characters` },
      { status: 400 },
    );
  }

  const canvas = parseCanvasContext(payload.canvas);
  if (!canvas) {
    return NextResponse.json(
      { error: "Invalid canvas context" },
      { status: 400 },
    );
  }
  if (!(await canEditProject(payload.projectId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!process.env.TRIGGER_SECRET_KEY) {
    return NextResponse.json(
      { error: "Trigger.dev is not configured" },
      { status: 503 },
    );
  }

  const taskPayload: GenerateBlueprintPayload = {
    projectId: payload.projectId,
    userId,
    prompt: payload.prompt.trim(),
    canvas,
  };

  try {
    const execution = await tasks.trigger<typeof generateBlueprintTask>(
      GENERATE_BLUEPRINT_TASK_ID,
      taskPayload,
    );
    return NextResponse.json(
      { runId: execution.id, status: "QUEUED" },
      { status: 202 },
    );
  } catch (error) {
    console.error("Could not start the Trigger.dev blueprint task.", error);
    return NextResponse.json(
      { error: "Blueprint generation could not be started" },
      { status: 503 },
    );
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runId = new URL(request.url).searchParams.get("runId");
  if (!runId || !/^[a-zA-Z0-9_-]{1,100}$/.test(runId)) {
    return NextResponse.json({ error: "Invalid execution ID" }, { status: 400 });
  }
  if (!process.env.TRIGGER_SECRET_KEY) {
    return NextResponse.json(
      { error: "Trigger.dev is not configured" },
      { status: 503 },
    );
  }

  try {
    const execution = await runs.retrieve<typeof generateBlueprintTask>(runId);
    const payload: unknown = execution.payload;
    if (
      execution.taskIdentifier !== GENERATE_BLUEPRINT_TASK_ID ||
      !isRecord(payload) ||
      payload.userId !== userId ||
      typeof payload.projectId !== "string" ||
      !isProjectId(payload.projectId) ||
      !(await canEditProject(payload.projectId, userId))
    ) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    if (execution.status === "COMPLETED") {
      return NextResponse.json({
        status: execution.status,
        output: execution.output,
      });
    }
    if (
      execution.status === "FAILED" ||
      execution.status === "CRASHED" ||
      execution.status === "SYSTEM_FAILURE" ||
      execution.status === "TIMED_OUT" ||
      execution.status === "CANCELED" ||
      execution.status === "EXPIRED"
    ) {
      return NextResponse.json(
        { status: execution.status, error: "Blueprint generation failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ status: execution.status });
  } catch (error) {
    console.error("Could not retrieve the Trigger.dev blueprint execution.", error);
    return NextResponse.json(
      { error: "Blueprint execution status is unavailable" },
      { status: 503 },
    );
  }
}
