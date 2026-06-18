import { getAgentPlannedActions } from "./agent.js";
import { tools } from "./tools.js";
// TODO 1: Import createEnforraClient from "./enforra-runtime.js"

/**
 * Runs the simulated agent scenarios through the Enforra runtime control layer.
 * Fill in the TODOs below to integrate Enforra policy checks!
 */
export async function runWorkshop() {
  console.log("\nWITH ENFORRA RUNTIME CONTROL (WORKSHOP EXERCISE)\n");

  // TODO 1: Initialize the local Enforra client using createEnforraClient
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
      // TODO 2: Evaluate the tool call before execution using enforra.evaluate
      // Pass agentId: "support-agent", tool: toolName, params: args
      const decision = { action: "allow" }; // Replace this with the actual evaluation call

      console.log(`Enforra decision: ${decision.action}`);

      // TODO 3: If decision is block, log "Tool blocked. It did not execute." and do not run it.

      // TODO 4: If decision is require_approval, log "Tool paused. Approval required before execution." and do not run it.

      // TODO 5: If decision is allowed or log_only, execute the tool.
      // If decision is log_only, write "Audit written."
      const toolFn = tools[toolName];
      if (toolFn) {
        await toolFn(args);
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
