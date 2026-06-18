import fs from "node:fs";
import path from "node:path";

const AUDIT_DIR = ".enforra";
const AUDIT_FILE = path.join(AUDIT_DIR, "audit.jsonl");

/**
 * Appends an entry to the Enforra audit log (.enforra/audit.jsonl).
 * If the file or directory does not exist, they will be created.
 *
 * @param {Object} entry
 * @param {string} entry.agentId
 * @param {string} entry.tool
 * @param {Object} entry.params
 * @param {string} entry.decision
 * @param {string} entry.matchedRule
 * @param {boolean} entry.executed
 * @param {string} entry.reason
 */
export function writeAuditLog({
  agentId,
  tool,
  params,
  decision,
  matchedRule,
  executed,
  reason,
}) {
  // Ensure the directory exists
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
  }

  const auditEntry = {
    timestamp: new Date().toISOString(),
    agentId,
    tool,
    params,
    decision,
    matchedRule,
    executed,
    reason,
  };

  fs.appendFileSync(AUDIT_FILE, JSON.stringify(auditEntry) + "\n", "utf8");
}

// Support running directly from the package.json script "npm run clean"
if (process.argv[1] === import.meta.filename || process.argv[2] === "clean") {
  cleanAuditLog();
}

export function cleanAuditLog() {
  if (fs.existsSync(AUDIT_FILE)) {
    try {
      fs.unlinkSync(AUDIT_FILE);
      console.log(`Successfully cleaned audit log: ${AUDIT_FILE}`);
    } catch (err) {
      console.error(`Failed to delete audit log: ${err.message}`);
    }
  } else {
    console.log("No audit log found. Nothing to clean.");
  }
}
