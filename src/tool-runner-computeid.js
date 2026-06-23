import { createEnforraClient } from "@enforra/sdk-node";
import { verifyAgentPassport } from "./computeid-passport.js";
import { tools } from "./tools.js";
import { computeIdScenarios } from "./scenarios-computeid.js";

export async function runComputeIdDemo() {
  console.log("=== ComputeID AgentPassport + Enforra Demo ===\n");

  const enforra = await createEnforraClient({
    policyPath: "./policy-computeid.yaml",
    auditPath: ".enforra/audit.jsonl",
  });

  for (const caseInfo of computeIdScenarios) {
    console.log(`\n--- Running: ${caseInfo.name} ---`);
    const { passport, tool: toolName, args } = caseInfo;

    // 1. Verify the AgentPassport
    const verification = verifyAgentPassport(passport);

    console.log(
      `AgentPassport verification: ${verification.verified ? "VERIFIED" : "FAILED"}`,
    );
    if (verification.verified) {
      console.log(`passport_id: ${verification.claims.passport_id}`);
      console.log(`agent: ${verification.claims.name}`);
      console.log(
        `capabilities: ${verification.claims.raw_capabilities.join(", ")}`,
      );
    } else {
      console.log(`Reason: ${verification.reason || "Verification failed"}`);
    }
    console.log("");

    let handlerExecuted = false;
    let decision = "block";
    let matchedPolicyId = "n/a";

    if (verification.verified) {
      try {
        // 2. Enforce policy using Enforra Client, passing verified claims in context
        const result = await enforra.enforceToolCall({
          agent: verification.claims.name,
          tool: toolName,
          args,
          context: {
            environment: "computeid-demo",
            agent_passport: verification.claims,
          },
          execute: async () => {
            const toolFn = tools[toolName];
            if (toolFn) {
              handlerExecuted = true;
              return await toolFn(args);
            }
            throw new Error(`Unknown tool: ${toolName}`);
          },
        });

        decision = result.decision;
        matchedPolicyId = result.matchedPolicyId || "n/a";
      } catch (err) {
        console.error(`Execution error: ${err.message}`);
      }
    } else {
      // If passport verification fails, we block before Enforra evaluation
      console.log(
        `Tool blocked before execution: Invalid or Revoked AgentPassport.`,
      );
      decision = "block";
    }

    console.log(`Tool call: ${toolName}`);
    console.log(`Enforra decision: ${decision}`);
    console.log(`Handler executed: ${handlerExecuted}`);

    // Print the trust/audit evidence record
    console.log("\nVerified Audit Evidence:");
    console.log(
      JSON.stringify(
        {
          passport_id: passport.passport_id,
          agent_passport_status: passport.status,
          agent_passport_capabilities: passport.capabilities,
          tool: toolName,
          decision,
          handlerExecuted,
        },
        null,
        2,
      ),
    );
  }

  console.log("\n=== Demo Complete ===");
}

if (process.argv[1] === import.meta.filename) {
  await runComputeIdDemo();
}
