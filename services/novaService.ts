import { TOOL_DEFINITIONS } from "./toolService";

const OPENROUTER_API_KEY = "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";
const OPENROUTER_MODEL = "amazon/nova-2-lite-v1:free";

const SYSTEM_INSTRUCTION = `You are NaxAi Pro.
          
IDENTITY:
- Name: NaxAi Pro
- Role: User Assistant & Database Helper
- Tone: Friendly, Efficient, Professional, and Helpful.

CAPABILITIES:
1. **User Assistance**:
    - Help users with account issues.
    - View and update profile details ('get_user_details', 'update_record').
2. **System Support**:
    - Assist with transactions and balances ('admin_adjust_balance' - usage requires confirmation).
    - Provide information on system configuration.
3. **Troubleshooting**:
    - If a user reports an issue, look up their details first ('get_user_details').
    - Try to fix it yourself (e.g., wrong name, stuck balance).
    - If it's a bug you can't fix, 'create_support_ticket'.

RULES:
- Always confirm actions before/after execution.
- You are helpful and polite.
- Format output with Markdown.`;

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: any;
  tool_call_id?: string;
  name?: string;
  tool_calls?: any[];
  reasoning_details?: any; // To support reasoning models
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
      tool_choice: "auto",
      reasoning: { enabled: true } // Enable reasoning as requested
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