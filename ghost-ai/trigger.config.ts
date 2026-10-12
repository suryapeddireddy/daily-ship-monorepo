import { defineConfig } from "@trigger.dev/sdk";

const project = process.env.TRIGGER_PROJECT_REF;
if (!project) {
  throw new Error("TRIGGER_PROJECT_REF must be set to configure Trigger.dev.");
}

export default defineConfig({
  project,
  runtime: "node",
  dirs: ["./trigger"],
  maxDuration: 300,
});
