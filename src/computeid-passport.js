/**
 * ComputeID AgentPassport Verification Module.
 *
 * In a real-world integration, this module would verify the cryptographic
 * signature of the AgentPassport using the ComputeID SDK/API and the issuer's public key.
 */

export function verifyAgentPassport(passport) {
  // In a real implementation:
  // 1. Verify signatures, timestamps, and revocation status via ComputeID API/SDK
  // 2. Return cryptographic proof and verified claims

  if (
    !passport ||
    passport.status !== "active" ||
    passport.revoked_at !== null
  ) {
    return {
      verified: false,
      claims: null,
      reason: "Passport is revoked or inactive",
    };
  }

  const capabilitiesStr = Array.isArray(passport.capabilities)
    ? passport.capabilities.join(",")
    : passport.capabilities || "";

  return {
    verified: true,
    claims: {
      passport_id: passport.passport_id,
      name: passport.name,
      organization: passport.organization,
      status: passport.status,
      capabilities: capabilitiesStr,
      raw_capabilities: passport.capabilities, // keep raw array for audit logging
      signature_algorithm: passport.signature_algorithm,
      issued_at: passport.issued_at,
      revoked_at: passport.revoked_at,
    },
  };
}
