# Enforra Agent Runtime Control Workshop

A tiny local workshop showing how to put a runtime control check between an AI agent and tool execution.

## What this is
- A fast, self-contained workshop to demonstrate runtime policy control.
- An example of how to block, allow, audit, or request human approval for tool calls before they execute.

## What this is not
- Not a production-ready agent.
- Not connected to real customer data (uses simulated data).
- **No API keys or cloud setup required.**
- This workshop uses a tiny local Enforra-style runtime adapter (`src/enforra-runtime.js`) so the workshop works locally without API keys, cloud setup, or SDK version issues. The integration point is exactly the same: placing the policy check immediately before tool execution.

---

## Prerequisites

- **Node.js** 20+
- **npm**

---

## Setup

```bash
git clone https://github.com/enforra/enforra-agent-runtime-workshop.git
cd enforra-agent-runtime-workshop
npm install
```

---

## Commands

### 1. Run Uncontrolled Agent
The agent runs without policy enforcement and executes all tools directly (including large refunds and customer deletion).
```bash
npm run before
```

### 2. Run Enforra-Controlled Agent
The agent runs with runtime control policy evaluation enabled.
```bash
npm run after
```

### 3. Run Side-by-Side Comparison
Runs both versions sequentially to see the difference clearly.
```bash
npm run demo
```

### 4. Clean Audit Logs
Deletes the local audit log file.
```bash
npm run clean
```

### 5. Run Verification Tests
Runs policy evaluation smoke checks.
```bash
npm test
```

---

## Key Integration Point

The main concept of this workshop is the placement of the policy check. Instead of executing tools immediately, evaluate the action with Enforra:

**Before:**
```javascript
await tools[toolName](args)
```

**After:**
```javascript
const decision = await enforra.evaluate({
  agentId: "support-agent",
  tool: toolName,
  params: args
})

if (decision.action === "block") {
  return
}

if (decision.action === "require_approval") {
  return
}

await tools[toolName](args)
```

---

## Where Enforra fits in your own agent

Find the line where your agent actually executes the selected tool. Enforra goes immediately before that line.

