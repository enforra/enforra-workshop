import fs from "node:fs";
import YAML from "yaml";
import { writeAuditLog } from "./audit.js";

/**
 * Creates an Enforra runtime client mimicking the behavior of @enforra/sdk-node.
 * This adapter makes the workshop self-contained and allows attendees to inspect
 * the core evaluation logic in clean, readable JavaScript.
 * 
 * @param {Object} options
 * @param {string} options.policyPath
 * @param {string} options.auditPath
 */
export async function createEnforraClient({ policyPath, auditPath }) {
  // Read and parse policy.yaml
  const rawPolicy = fs.readFileSync(policyPath, "utf8");
  const policy = YAML.parse(rawPolicy);

  // Define the evaluate function
  const evaluate = async ({ agentId, tool, params }) => {
    // Re-read policy.yaml on each evaluation so that attendees can edit the file
    // and see updates instantly without restarting the application!
    const freshRawPolicy = fs.readFileSync(policyPath, "utf8");
    const freshPolicy = YAML.parse(freshRawPolicy);

    let matchedRule = "default";
    let decision = freshPolicy.defaults?.decision || "log_only";

    // Evaluate rules in order
    const rules = freshPolicy.policies || [];
    for (const rule of rules) {
      if (ruleMatches(rule, agentId, tool, params)) {
        matchedRule = rule.id || rule.description || "unnamed rule";
        decision = rule.decision;
        break;
      }
    }

    // Determine if tool is executed under this decision
    const executed = (decision === "allow" || decision === "log_only");
    let reason = "";
    if (decision === "allow") {
      reason = "Tool execution allowed by policy";
    } else if (decision === "log_only") {
      reason = "Tool execution allowed and logged";
    } else if (decision === "block") {
      reason = "Tool execution blocked by policy rule";
    } else if (decision === "require_approval") {
      reason = "Approval required before tool execution";
    }

    // Write to audit log if auditPath is configured
    if (auditPath) {
      writeAuditLog({
        agentId,
        tool,
        params,
        decision,
        matchedRule,
        executed,
        reason
      });
    }

    return {
      action: decision,
      matchedRule
    };
  };

  // Return the client interface
  return {
    evaluate,

    /**
     * Mirror of the official @enforra/sdk-node enforceToolCall method.
     * Exposed here so attendees see how the code matches production code.
     */
    enforceToolCall: async ({ agent, tool, args, execute }) => {
      const decision = await evaluate({ agentId: agent, tool, params: args });
      if (decision.action === "block" || decision.action === "require_approval") {
        return {
          ok: false,
          decision: decision.action,
          matchedPolicyId: decision.matchedRule,
          executed: false
        };
      }
      const data = await execute();
      return {
        ok: true,
        decision: decision.action,
        matchedPolicyId: decision.matchedRule,
        executed: true,
        data
      };
    }
  };
}

/**
 * Checks if a policy rule matches the given agent, tool, and parameters.
 */
function ruleMatches(rule, agentId, tool, params) {
  // 1. Match Agent (optional)
  if (rule.match?.agent && rule.match.agent !== agentId) {
    return false;
  }

  // 2. Match Tool (optional)
  if (rule.match?.tool && rule.match.tool !== "*" && rule.match.tool !== tool) {
    return false;
  }

  // 3. Match Conditions (optional)
  if (rule.conditions) {
    const conditions = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
    for (const condition of conditions) {
      if (!evaluateCondition(condition, params)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Evaluates a single policy condition against parameters.
 */
function evaluateCondition(condition, params) {
  const { field, operator, value } = condition;
  
  // Extract actual value (handles field syntax like 'args.amount' or 'params.amount')
  const path = field.replace(/^(args|params)\./, "");
  const actualValue = params[path];

  if (actualValue === undefined) {
    return false;
  }

  switch (operator) {
    case "eq":
      return actualValue === value;
    case "neq":
      return actualValue !== value;
    case "gt":
      return typeof actualValue === "number" && actualValue > value;
    case "gte":
      return typeof actualValue === "number" && actualValue >= value;
    case "lt":
      return typeof actualValue === "number" && actualValue < value;
    case "lte":
      return typeof actualValue === "number" && actualValue <= value;
    case "contains":
      return typeof actualValue === "string" && actualValue.includes(value);
    case "not_contains":
      return typeof actualValue === "string" && !actualValue.includes(value);
    default:
      return false;
  }
}
