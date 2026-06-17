import { getAgentPlannedActions } from "./agent.js";
import { tools } from "./tools.js";
import { createEnforraClient } from "./enforra-runtime.js";

/**
 * Runs the simulated agent scenarios through the Enforra runtime control layer.
 * Evaluates decisions based on policy.yaml and logs audit records to .enforra/audit.jsonl.
 */
export async function runAfter() {
  console.log("\nWITH ENFORRA RUNTIME CONTROL\n");

  // Initialize the local Enforra client wrapper
  const enforra = await createEnforraClient({
    policyPath: "./policy.yaml",
    auditPath: ".enforra/audit.jsonl"
  });

  const plannedActions = getAgentPlannedActions();

  for (const action of plannedActions) {
    const { tool: toolName, args } = action;
    const amountStr = args.amount !== undefined ? ` amount=${args.amount}` : "";
    console.log(`Agent wants to call: ${toolName}${amountStr}`);

    try {
      // Evaluate policy rules before execution
      const decision = await enforra.evaluate({
        agentId: "support-agent",
        tool: toolName,
        params: args
      });

      console.log(`Enforra decision: ${decision.action}`);

      if (decision.action === "block") {
        console.log("Tool blocked. It did not execute.");
      } else if (decision.action === "require_approval") {
        console.log("Tool paused. Approval required before execution.");
      } else if (decision.action === "log_only") {
        const toolFn = tools[toolName];
        if (toolFn) {
          await toolFn(args);
        }
        console.log("Audit written.");
      } else if (decision.action === "allow") {
        const toolFn = tools[toolName];
        if (toolFn) {
          await toolFn(args);
        }
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
