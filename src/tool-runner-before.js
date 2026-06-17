import { getAgentPlannedActions } from "./agent.js";
import { tools } from "./tools.js";

/**
 * Runs the simulated agent scenarios directly (without Enforra control).
 * Illustrates the security problem where an agent has unrestricted access to all tools.
 */
export async function runBefore() {
  console.log("\nWITHOUT RUNTIME CONTROL\n");

  const plannedActions = getAgentPlannedActions();

  for (const action of plannedActions) {
    const { tool: toolName, args } = action;
    const amountStr = args.amount !== undefined ? ` amount=${args.amount}` : "";
    console.log(`Agent wants to call: ${toolName}${amountStr}`);

    try {
      const toolFn = tools[toolName];
      if (toolFn) {
        await toolFn(args);
      } else {
        console.error(`Unknown tool: ${toolName}`);
      }
    } catch (err) {
      console.error(`Tool error: ${err.message}`);
    }
    console.log(""); // Empty line for readability
  }

  console.log("Problem:");
  console.log("The agent can call every tool directly.\n");
}

// Run immediately if this file is executed directly
if (process.argv[1] === import.meta.filename) {
  await runBefore();
}
