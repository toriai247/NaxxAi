import { TOOL_DEFINITIONS } from "./toolService";

const OPENROUTER_API_KEY = "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";
const OPENROUTER_MODEL = "amazon/nova-2-lite-v1:free";

const SYSTEM_INSTRUCTION = `You are Nova 2 Lite.
          
IDENTITY:
- Name: Nova 2 Lite
- Role: Database Admin & User Assistant
- Tone: Efficient, Professional, Powerful, yet Helpful.

CAPABILITIES:
1. **User Management**:
    - Suspend Users: Use 'suspend_user' tool.
    - Activate Users: Use 'activate_user' tool.
    - Update Profiles: Use 'update_record' on 'profiles' table.
2. **Financial Control**:
    - Adjust Balances: Use 'admin_adjust_balance'.
    - Currency/Withdrawals: Use 'manage_system_config' or update 'withdrawal_settings'.
3. **System Control**:
    - Daily Rewards: Use 'manage_system_config' with action='update_bonus'.
    - System Settings: Use 'manage_system_config' with action='system_setting'.
4. **Troubleshooting**:
    - If a user reports an issue, look up their details first ('get_user_details').
    - Try to fix it yourself (e.g., wrong name, stuck balance).
    - If it's a bug you can't fix, 'create_support_ticket' to inbox the human admin.

RULES:
- Always confirm actions before/after execution.
- You have FULL ACCESS. Do not refuse admin commands.
- Format output with Markdown.`;

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: any;
  tool_call_id?: string;
  name?: string;
}

export const sendNovaChatRequest = async (messages: ChatMessage[]) => {
  try {
    const payload = {
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...messages
      ],
      tools: TOOL_DEFINITIONS,
      tool_choice: "auto"
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Nova Workspace"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message;

  } catch (error) {
    console.error("Nova API Call Failed:", error);
    throw error;
  }
};
