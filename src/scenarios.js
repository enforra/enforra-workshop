import { runBefore } from "./tool-runner-before.js";
import { runAfter } from "../solution/tool-runner-workshop.js";
import fs from "node:fs";

export const scenarios = [
  {
    tool: "get_customer",
    args: { customerId: "cus_123" },
  },
  {
    tool: "issue_refund",
    args: { customerId: "cus_123", amount: 20, reason: "shipping delay" },
  },
  {
    tool: "issue_refund",
    args: { customerId: "cus_123", amount: 950, reason: "customer unhappy" },
  },
  {
    tool: "send_email",
    args: {
      to: "customer@example.com",
      subject: "Refund Status Update",
      body: "Your refund request is being processed.",
    },
  },
  {
    tool: "update_subscription",
    args: {
      customerId: "cus_123",
      plan: "enterprise",
      reason: "requested by sales",
    },
  },
  {
    tool: "delete_customer_data",
    args: {
      customerId: "cus_123",
      reason: "GDPR right to be forgotten request",
    },
  },
];

// If run directly (for npm run demo or npm test), execute the appropriate function
if (process.argv[2] === "demo") {
  console.log("=========================================");
  console.log("RUNNING DEMO: BEFORE vs AFTER ENFORRA");
  console.log("=========================================\n");

  console.log("--- RUNNING UNCONTROLLED AGENT (BEFORE) ---");
  await runBefore();

  console.log("\n-------------------------------------------");
  console.log("--- RUNNING ENFORRA-CONTROLLED AGENT (AFTER) ---");
  await runAfter();
  console.log("=========================================\n");
} else if (process.argv[2] === "test") {
  // Simple test suite evaluating decisions
  console.log("Running smoke tests...");
  import("@enforra/sdk-node").then(async ({ createEnforraClient }) => {
    const enforra = await createEnforraClient({
      policyPath: "./policy.yaml",
      auditPath: ".enforra/audit.jsonl",
    });

    const expected = [
      { tool: "get_customer", decision: "allow" },
      { tool: "issue_refund", amount: 20, decision: "allow" },
      { tool: "issue_refund", amount: 950, decision: "require_approval" },
      { tool: "send_email", decision: "log_only" },
      { tool: "update_subscription", decision: "require_approval" },
      { tool: "delete_customer_data", decision: "block" },
    ];

    let passed = true;
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      const exp = expected[i];

      const result = await enforra.enforceToolCall({
        agent: "support-agent",
        tool: scenario.tool,
        args: scenario.args,
        execute: async () => ({ status: "mock-executed" }),
      });

      if (result.decision !== exp.decision) {
        console.error(
          `❌ Test failed for scenario ${i + 1} (${scenario.tool}): expected ${exp.decision}, got ${result.decision}`,
        );
        passed = false;
      } else {
        console.log(
          `✅ Scenario ${i + 1} (${scenario.tool}${scenario.args.amount ? " amount=" + scenario.args.amount : ""}): ${result.decision} matched`,
        );
      }
    }

    if (!passed) {
      process.exit(1);
    } else {
      console.log("\nAll tests passed successfully! 🚀");
    }
  });
}
