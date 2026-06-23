# Enforra Agent Runtime Control Workshop

A tiny local workshop showing how to put a runtime control check between an AI agent and tool execution.

**This is not a tutorial on building an AI agent from scratch.**

This workshop teaches one integration point: **find the place where your agent is about to execute a tool, then check policy before that tool runs.**

This workshop installs the real `@enforra/sdk-node` package. The fake agent is only used so everyone gets the same tool calls. The real exercise is adding Enforra before tool execution.

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

- `solution/tool-runner-workshop.js`  
  The completed reference solution using the real Enforra SDK.

- `policy.yaml`  
  The runtime policy.

- `.enforra/audit.jsonl`  
  Local audit log created after running the controlled workflow.

---

## Before the workshop

Please install:

- Node.js 20 or newer
- npm
- Git

Check your setup:

```bash
node -v
npm -v
git --version
```

If `node -v` shows a version below 20, please install Node.js 20 or newer before the workshop.

---

## Setup

```bash
git clone https://github.com/enforra/enforra-workshop.git
cd enforra-workshop
npm install
```

_Note: Running `npm install` installs the real `@enforra/sdk-node` package from the public npm registry._

---

## Reference solution

The hands-on file is:

```bash
src/tool-runner-workshop.js
```

If you get stuck, compare it with the completed version:

```bash
solution/tool-runner-workshop.js
```

Do not start in the `solution/` folder. It is only a reference.

To run the completed version from the repo root:

```bash
npm run solution
```

---

## Where the SDK is used

- **Attendee Exercise File**: `src/tool-runner-workshop.js`  
  You will import and configure `@enforra/sdk-node` here.
- **Reference Solution**: `solution/tool-runner-workshop.js`  
  A completed reference implementation of the Enforra SDK.

---

## Step-by-step workshop

### Step 1: Run the unsafe version

```bash
npm run before
```

In this version, the agent calls tools directly. Notice that even risky actions can execute.

### Step 2: Open the unsafe runner

```bash
src/tool-runner-before.js
```

Locate the line where the selected tool is called directly.

### Step 3: Open the policy

```bash
policy.yaml
```

The policy controls what happens before each tool runs. Explain the decisions.

### Step 4: Open the hands-on file

```bash
src/tool-runner-workshop.js
```

### Step 5: Add Enforra before tool execution

Attendees should complete the TODOs to:

- Create the Enforra client
- Call Enforra before tool execution
- Block blocked actions
- Pause actions that require approval
- Execute only allowed or logged actions

### Step 6: Run their implementation

```bash
npm run workshop
```

Observe the output to verify if the policy checks are working correctly.

### Step 7: If stuck, compare with:

```bash
solution/tool-runner-workshop.js
```

or run the completed solution directly:

```bash
npm run solution
```

### Step 8: View the audit log

```bash
cat .enforra/audit.jsonl
```

The audit log shows what the agent tried to do, what decision was made, and whether the tool executed.

### Step 9: Change one policy rule in `policy.yaml` and rerun:

Change one rule in `policy.yaml`:

- Change the refund approval threshold from `100` to `500`.
- Change `send_email` from `log_only` to `require_approval`.
- Change the default decision from `log_only` to `block`.

Then rerun the workshop:

```bash
npm run workshop
```

The important point: **you changed agent behavior by changing policy, not by rewriting the agent.**

## Bonus exercise: create a new policy rule

_This is optional. Skip it if you are still working through the main exercise._

If you finish early, try changing the policy for `update_subscription`.

The goal is to make Enforra require approval only when the requested plan is `enterprise`.

Start by opening:

```bash
policy.yaml
```

Find the existing `update_subscription` rule.

Replace it with a more specific rule (note that `eq` stands for "equals"):

```yaml
- id: require-approval-for-enterprise-subscription
  description: "Require approval for enterprise subscription changes"
  match:
    tool: update_subscription
  conditions:
    - field: args.plan
      operator: eq
      value: enterprise
  decision: require_approval
```

Then run:

```bash
npm run workshop
```

If your Enforra integration is complete, the `update_subscription` call should pause before execution with:

```text
Enforra decision: require_approval
```

Then try changing the plan in the planned tool call (inside `src/scenarios.js`) from `enterprise` to `starter` or `pro`. The decision should fall back to the default policy decision (`log_only` or whatever you configured).

If you get stuck, compare your `policy.yaml` with:

```bash
solution/bonus-policy.yaml
```

Do not start in the `solution/` folder. It is only there as a reference.

**Main lesson:**
You changed what the agent is allowed to do by changing policy, not by rewriting the agent.

## Optional demo: ComputeID AgentPassport as trusted policy input

ComputeID answers:
"Who is this agent, and is it really who it claims to be?"

Enforra answers:
"Should this verified agent be allowed to perform this specific action right now?"

This demo verifies an AgentPassport, passes verified claims into Enforra policy as `context.agent_passport`, and then controls tool execution based on those claims.

Without ComputeID, Enforra enforces policy based on declared agent context. With ComputeID, Enforra enforces policy based on verified identity and signed capabilities.

To run the demo:

```bash
npm run computeid
```

Files involved in the demo:

- `src/computeid-passport.js` - Mock verifier of cryptographic signatures/AgentPassport.
- `src/tool-runner-computeid.js` - Runs the demo scenarios showing AgentPassport verification and Enforra integration.
- `src/scenarios-computeid.js` - Mock scenarios for the ComputeID demo.
- `policy-computeid.yaml` - Policy configured with passport capabilities & revocation status conditions.

---

## Key Integration Point

The main concept of this workshop is the placement of the policy check. Instead of executing tools immediately, evaluate the action with Enforra:

**Before:**

```javascript
await tools[toolName](args);
```

**After (SDK Integration):**

```javascript
const result = await enforra.enforceToolCall({
  agent: "support-agent",
  tool: toolName,
  args,
  context: { environment: "workshop" },
  execute: async () => tools[toolName](args),
});

if (result.decision === "block") {
  // handle block
}
```

The exact SDK API may change as Enforra evolves. The important pattern stays the same: call Enforra before your agent executes the selected tool.

---

## Where Enforra fits in your own agent

Find the line where your agent actually executes the selected tool. Enforra goes immediately before that line.
