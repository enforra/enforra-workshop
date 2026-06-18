# Enforra Agent Runtime Control Workshop

A tiny local workshop showing how to put a runtime control check between an AI agent and tool execution.

**This is not a tutorial on building an AI agent from scratch.**

This workshop teaches one integration point: **find the place where your agent is about to execute a tool, then check policy before that tool runs.**

The fake agent is only here to make the workshop predictable. The Enforra SDK integration is real.

In the hands-on part, you will edit one file:

`src/tool-runner-workshop.js`

You will add the Enforra SDK check before the tool executes.

---

## What you will build

You will run a tiny customer support agent workflow.

The agent wants to call tools like:

- `get_customer`
- `issue_refund`
- `send_email`
- `delete_customer_data`

First, you will run the workflow without runtime control.

Then you will run the same workflow with a policy check before tool execution.

The goal is to see how Enforra runtime control can decide:

- allow
- log_only
- require_approval
- block

## How the fake agent works

This workshop does not use a real LLM or API key.

Instead, `src/agent.js` returns a fixed list of tool calls.

That keeps the workshop predictable for everyone.

In a real agent application, an LLM might decide which tool to call. The integration point is still the same:

find the line where the selected tool is about to execute, then check policy before running it.

---

## File map

- `src/agent.js`  
  A fake support agent that returns planned tool calls.

- `src/tools.js`  
  Simulated business tools.

- `src/tool-runner-before.js`  
  Runs the agent without runtime control.

- `src/tool-runner-workshop.js`  
  The attendee exercise file. You will add the runtime control checks here.

- `src/tool-runner-after.js`  
  Runs the agent with a policy check before tool execution (completed version).

- `policy.yaml`  
  The runtime policy.

- `.enforra/audit.jsonl`  
  Local audit log created after running the controlled workflow.

---

## Prerequisites

- **Node.js** 20+
- **npm**

---

## Setup

```bash
git clone https://github.com/enforra/enforra-workshop.git
cd enforra-workshop
npm install
```

*Note: Running `npm install` installs the real `@enforra/sdk-node` package from the public npm registry.*

---

## Where the SDK is used

- **Attendee Exercise File**: `src/tool-runner-workshop.js`  
  You will import and configure `@enforra/sdk-node` here.
- **Reference Solution**: `src/tool-runner-after.js`  
  A completed reference implementation of the Enforra SDK.

---

## Step-by-step workshop

### Step 1: Run the unsafe version

```bash
npm run before
```

In this version, the agent calls tools directly. Notice that even risky actions can execute.

### Step 2: Open the unsafe tool runner

Open `src/tool-runner-before.js` and locate the line where the selected tool is called directly.

### Step 3: Open the policy file

Open `policy.yaml` and explain the decisions.

### Step 4: Add runtime control

Open:

`src/tool-runner-workshop.js`

This is the main hands-on exercise.

You will fill in the TODOs to:

* Import the Enforra client from `@enforra/sdk-node`
* Create the Enforra client using `policy.yaml` and `.enforra/audit.jsonl`
* Wrap each tool call with `enforceToolCall`
* Pass agent, tool, args, context, and execute callback
* Print decision result and show whether the tool executed

### Step 5: Run the workshop file

```bash
npm run workshop
```

Observe the output to verify if the policy checks are working correctly.

### Step 6: Stuck? Check the solution

If you get stuck, compare your implementation with `src/tool-runner-after.js` or run the completed solution directly:

```bash
npm run solution
```

### Step 7: View the audit log

```bash
cat .enforra/audit.jsonl
```

The audit log shows what the agent tried to do, what decision was made, and whether the tool executed.

### Step 8: Change one policy rule and test it

Change one rule in `policy.yaml`:

* Change the refund approval threshold from `100` to `500`.
* Change `send_email` from `log_only` to `require_approval`.
* Change the default decision from `log_only` to `block`.

Then rerun the workshop:

```bash
npm run workshop
```

The important point: **you changed agent behavior by changing policy, not by rewriting the agent.**

---

## Key Integration Point

The main concept of this workshop is the placement of the policy check. Instead of executing tools immediately, evaluate the action with Enforra:

**Before:**
```javascript
await tools[toolName](args)
```

**After (SDK Integration):**
```javascript
const result = await enforra.enforceToolCall({
  agent: "support-agent",
  tool: toolName,
  args,
  context: { environment: "workshop" },
  execute: async () => tools[toolName](args)
});

if (result.decision === "block") {
  // handle block
}
```

The exact SDK API may change as Enforra evolves. The important pattern stays the same: call Enforra before your agent executes the selected tool.

---

## Where Enforra fits in your own agent

Find the line where your agent actually executes the selected tool. Enforra goes immediately before that line.
