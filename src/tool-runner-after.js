import { getAgentPlannedActions } from "./agent.js";
import { tools } from "./tools.js";
import { createEnforraClient } from "@enforra/sdk-node";

/**
 * Runs the simulated agent scenarios through the Enforra runtime control layer.
 * Evaluates decisions using the real @enforra/sdk-node package based on policy.yaml.
 */
export async function runAfter() {
  console.log("\nWITH ENFORRA RUNTIME CONTROL\n");

  // Initialize the real Enforra SDK client
  const enforra = await createEnforraClient({
    policyPath: "./policy.yaml",
    auditPath: ".enforra/audit.jsonl",
  });

  const plannedActions = getAgentPlannedActions();

  for (const action of plannedActions) {
    const { tool: toolName, args } = action;
    const amountStr = args.amount !== undefined ? ` amount=${args.amount}` : "";
    console.log(`Agent wants to call: ${toolName}${amountStr}`);

    try {
      // Enforce policies before tool execution using the SDK
      const result = await enforra.enforceToolCall({
        agent: "support-agent",
        tool: toolName,
        args,
        context: {
          environment: "workshop",
        },
        execute: async () => {
          const toolFn = tools[toolName];
          if (toolFn) {
            return await toolFn(args);
          }
          throw new Error(`Unknown tool: ${toolName}`);
        },
      });

      console.log(`Enforra decision: ${result.decision}`);

      if (result.decision === "block") {
        console.log("Tool blocked. It did not execute.");
      } else if (result.decision === "require_approval") {
        console.log("Tool paused. Approval required before execution.");
      } else if (result.decision === "log_only") {
        console.log("Audit written.");
      }
    } catch (err) {
      console.error(`Evaluation/execution error: ${err.message}`);
    }
    console.log(""); // Empty line for readability
  }
}

// Run immediately if this file is executed directly
if (process.argv[1] === import.meta.filename) {
  await runAfter();
}
