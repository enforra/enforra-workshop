export const demoPassports = {
  standard: {
    passport_id: "37f94d46-demo-4b8e-b2aa-1aa06demo",
    name: "test-agent",
    organization: "XXXXX AI",
    status: "active",
    capabilities: ["read", "api_call"],
    public_key:
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----",
    signature_algorithm: "RSA-SHA256",
    issued_at: "2026-06-17T18:51:11.126Z",
    revoked_at: null,
  },
  billing: {
    passport_id: "72f94d46-demo-4b8e-b2aa-2bb06demo",
    name: "test-agent",
    organization: "XXXXX AI",
    status: "active",
    capabilities: ["read", "api_call", "billing_write"],
    public_key:
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----",
    signature_algorithm: "RSA-SHA256",
    issued_at: "2026-06-17T19:00:00.000Z",
    revoked_at: null,
  },
  revoked: {
    passport_id: "99f94d46-demo-4b8e-b2aa-99a06demo",
    name: "revoked-agent",
    organization: "XXXXX AI",
    status: "revoked",
    capabilities: ["read", "api_call"],
    public_key:
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----",
    signature_algorithm: "RSA-SHA256",
    issued_at: "2026-06-17T18:51:11.126Z",
    revoked_at: "2026-06-18T10:00:00.000Z",
  },
};

export const computeIdScenarios = [
  {
    name: "Case 1: Active passport, safe read tool",
    passport: demoPassports.standard,
    tool: "get_customer",
    args: { customerId: "cus_123" },
  },
  {
    name: "Case 2: Active passport, billing action without billing_write capability",
    passport: demoPassports.standard,
    tool: "issue_refund",
    args: { customerId: "cus_123", amount: 250, reason: "overcharged" },
  },
  {
    name: "Case 3: Active passport, billing action with billing_write capability",
    passport: demoPassports.billing,
    tool: "issue_refund",
    args: { customerId: "cus_123", amount: 250, reason: "overcharged" },
  },
  {
    name: "Case 4: Inactive/Revoked passport",
    passport: demoPassports.revoked,
    tool: "send_email",
    args: { to: "customer@example.com", subject: "Update", body: "Hello" },
  },
];
