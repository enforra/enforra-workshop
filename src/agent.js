import { scenarios } from "./scenarios.js";

/**
 * A fake deterministic agent representing a customer support agent.
 * In a real-world system, this agent would dynamically choose tools and parameter values
 * using a Large Language Model (LLM) API like OpenAI or Anthropic.
 *
 * For the workshop, we use this mock to guarantee consistent output for all attendees.
 */
export function getAgentPlannedActions() {
  return scenarios;
}
