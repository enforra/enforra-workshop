# Enforra Agent Runtime Control Workshop

A tiny local workshop showing how to put a runtime control check between an AI agent and tool execution.

## What you will build

You will run a tiny customer support agent workflow.

The agent wants to call tools like:

- `get_customer`
- `issue_refund`
- `send_email`
- `delete_customer_data`

First, you will run the workflow without runtime control.

Then you will run the same workflow with a policy check before tool execution.

The goal is to see how Enforra-style runtime control can decide:

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

- `src/tool-runner-after.js`  
  Runs the agent with a policy check before tool execution.

- `src/enforra-runtime.js`  
  A tiny local Enforra-style runtime adapter for the workshop.

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

---

## Step-by-step workshop

### Step 1: Run the unsafe version

```bash
npm run before
```

In this version, the agent calls tools directly.

Notice that even risky actions can execute.

### Step 2: Open the fake agent

Open:

`src/agent.js`

This file shows the planned tool calls.

### Step 3: Open the tools

Open:

`src/tools.js`

These are the actions the agent can take.

### Step 4: Open the policy

Open:

`policy.yaml`

The policy controls what happens before each tool runs.

### Step 5: Open the runtime-controlled runner

Open:

`src/tool-runner-after.js`

Look for the policy check before tool execution.

This is the key integration point.

### Step 6: Run the controlled version

```bash
npm run after
```

You should see:

* safe customer lookup allowed
* small refund allowed
* large refund paused for approval
* email logged
* customer deletion blocked

### Step 7: View the audit log

```bash
cat .enforra/audit.jsonl
```

The audit log shows what the agent tried to do, what decision was made, and whether the tool executed.

### Step 8: Change one policy rule

Try one change:

* change the refund approval threshold from `100` to `500`
* change `send_email` from `log_only` to `require_approval`
* change the default decision from `log_only` to `block`

Then rerun:

```bash
npm run after
```

The important point:

you changed agent behavior by changing policy, not by rewriting the agent.

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
