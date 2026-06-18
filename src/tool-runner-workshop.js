import { getAgentPlannedActions } from "./agent.js";
import { tools } from "./tools.js";
// TODO 1: Import createEnforraClient from "@enforra/sdk-node"

/**
 * Runs the simulated agent scenarios through the Enforra runtime control layer.
 * Fill in the TODOs below to integrate the real Enforra SDK!
 */
export async function runWorkshop() {
  console.log("\nWITH ENFORRA RUNTIME CONTROL (WORKSHOP EXERCISE)\n");

  // TODO 2: Initialize the Enforra client using createEnforraClient
  // Pass policyPath: "./policy.yaml" and auditPath: ".enforra/audit.jsonl"
  const enforra = null; 

  const plannedActions = getAgentPlannedActions();

  for (const action of plannedActions) {
    const { tool: toolName, args } = action;
    const amountStr = args.amount !== undefined ? ` amount=${args.amount}` : "";
    console.log(`Agent wants to call: ${toolName}${amountStr}`);

    // Temporary code so the script runs before integration is completed.
    // REMOVE or comment out this block when implementing your TODOs below!
    if (!enforra) {
      console.log("(Enforra integration pending...)");
      const toolFn = tools[toolName];
      if (toolFn) {
        await toolFn(args);
      }
      console.log("");
      continue;
    }

    try {
      // TODO 3: Wrap the tool call with enforra.enforceToolCall
      // TODO 4: Pass agent, tool, args, context, and the execute callback
      // The execute callback should execute the actual tool (e.g. tools[toolName](args))
      const result = { decision: "allow" }; // Replace this with the enforra.enforceToolCall call

      // TODO 5: Print the decision result (e.g., result.decision)
      // and handle logging for 'block', 'require_approval', and 'log_only'
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
  await runWorkshop();
}
