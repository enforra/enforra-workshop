# Enforra Agent Runtime Workshop - Solution

This directory contains the completed reference configuration for the workshop.

## Reference Policy (`solution/policy.yaml`)

The policy file uses the standard Enforra rules schema to enforce security:
- **Allow** safe customer checks (`get_customer`).
- **Allow** small refunds under `$100` (`issue_refund`).
- **Require Approval** for refunds over `$100` (`issue_refund`).
- **Block** customer data deletion entirely (`delete_customer_data`).
- **Log only** outbound emails (`send_email`).
- **Default Action** is `log_only` for any unspecified tool calls.

## How to use the solution reference

If you get lost during the workshop or want to restore the default policy:

```bash
# Copy the solution policy over the main policy file
cp solution/policy.yaml policy.yaml
```
