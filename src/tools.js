/**
 * Simulated business tools for customer support.
 * In a real application, these would connect to databases, payment APIs, or email providers.
 */

export const tools = {
  get_customer: async ({ customerId }) => {
    console.log(
      `[Tool Executed] get_customer: Retrieved customer profile for ${customerId}`,
    );
    return {
      customerId,
      name: "Jane Doe",
      email: "jane@example.com",
      status: "Active",
    };
  },

  issue_refund: async ({ customerId, amount, reason }) => {
    console.log(
      `[Tool Executed] issue_refund: Refunded $${amount} to ${customerId} (Reason: "${reason}")`,
    );
    return {
      success: true,
      transactionId: `tx_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      customerId,
    };
  },

  send_email: async ({ to, subject, body }) => {
    console.log(
      `[Tool Executed] send_email: Sent email to <${to}> with subject "${subject}"`,
    );
    return {
      success: true,
      messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
    };
  },

  delete_customer_data: async ({ customerId, reason }) => {
    console.log(
      `[Tool Executed] delete_customer_data: Permanently deleted customer ${customerId} (Reason: "${reason}")`,
    );
    return {
      success: true,
      customerId,
      deletedAt: new Date().toISOString(),
    };
  },

  update_subscription: async ({ customerId, plan, reason }) => {
    console.log(
      `[Tool Executed] update_subscription: Changed customer ${customerId} to ${plan} plan (Reason: "${reason}")`,
    );
    return {
      success: true,
      customerId,
      plan,
      updatedAt: new Date().toISOString(),
    };
  },
};
