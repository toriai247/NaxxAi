import { supabase } from "../integrations/supabase/client";
import { ALL_TABLES } from "../constants";

// --- Tool Implementations ---

const toolsFuncs = {
  read_table: async ({ table_name, limit = 10 }: any) => {
    if (!ALL_TABLES.includes(table_name)) return { error: `Invalid table. Options: ${ALL_TABLES.join(", ")}` };
    const { data, error } = await supabase.from(table_name).select('*').limit(limit).order('created_at', { ascending: false });
    if (error) return { error: error.message };
    return { 
      result: `Fetched ${data?.length} rows from ${table_name}`, 
      cardType: 'table_view', 
      cardData: { title: table_name, subtitle: "Recent Records", data } 
    };
  },

  search_database: async ({ table_name, column, value }: any) => {
    const { data, error } = await supabase.from(table_name).select('*').eq(column, value).limit(20);
    if (error) return { error: error.message };
    return { 
      result: `Found ${data?.length} matches in ${table_name}`,
      cardType: 'table_view',
      cardData: { title: `Search: ${table_name}`, subtitle: `${column} = ${value}`, data }
    };
  },

  get_user_details: async ({ identifier }: any) => {
    let { data: profile } = await supabase.from('profiles').select('*').eq('email_1', identifier).single();
    if (!profile) {
       const { data: p2 } = await supabase.from('profiles').select('*').eq('id', identifier).single();
       profile = p2;
    }
    if (!profile) return { error: "User not found" };

    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', profile.id).single();
    
    return {
      result: `Retrieved details for ${profile.name_1}`,
      cardType: 'user_profile',
      cardData: { title: profile.name_1 || "User", subtitle: profile.email_1, profile, wallet: wallet || {} }
    };
  },

  update_record: async ({ table_name, id_column, id_value, updates_json }: any) => {
    try {
      const updates = typeof updates_json === 'string' ? JSON.parse(updates_json) : updates_json;
      const { data, error } = await supabase.from(table_name).update(updates).eq(id_column, id_value).select();
      if (error) return { error: error.message };
      return { result: "Update successful", data };
    } catch (e: any) { return { error: `Update failed: ${e.message}` }; }
  },

  insert_record: async ({ table_name, data_json }: any) => {
    try {
      const rowData = typeof data_json === 'string' ? JSON.parse(data_json) : data_json;
      const { data, error } = await supabase.from(table_name).insert(rowData).select();
      if (error) return { error: error.message };
      return { result: "Insert successful", data };
    } catch (e: any) { return { error: `Insert failed: ${e.message}` }; }
  },

  suspend_user: async ({ email, reason }: any) => {
    const { data: user } = await supabase.from('profiles').select('id').eq('email_1', email).single();
    if (!user) return { error: "User not found" };

    const { error } = await supabase.from('profiles').update({ 
        is_suspended: true, 
        is_account_active: false,
        admin_notes: reason 
    }).eq('id', user.id);

    if (error) return { error: error.message };
    return { result: `User ${email} has been SUSPENDED. Reason: ${reason}` };
  },

  activate_user: async ({ email }: any) => {
    const { data: user } = await supabase.from('profiles').select('id').eq('email_1', email).single();
    if (!user) return { error: "User not found" };

    const { error } = await supabase.from('profiles').update({ 
        is_suspended: false, 
        is_account_active: true,
        admin_notes: 'Re-activated by Nova Admin'
    }).eq('id', user.id);

    if (error) return { error: error.message };
    return { result: `User ${email} has been REACTIVATED.` };
  },

  create_support_ticket: async ({ user_email, issue_description, priority = "normal" }: any) => {
    const { data, error } = await supabase.from('help_requests').insert({
      email: user_email,
      message: issue_description,
      status: 'pending',
      admin_response: `Nova Auto-Ticket: ${priority}`
    }).select();
    
    if (error) return { error: `Failed to create ticket: ${error.message}` };
    return { result: `Support ticket created successfully for ${user_email}. Admin has been notified.` };
  },

  admin_adjust_balance: async ({ user_email, amount, balance_type = 'main_balance' }: any) => {
    const { data: user } = await supabase.from('profiles').select('id').eq('email_1', user_email).single();
    if (!user) return { error: "User not found" };
    
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!wallet) return { error: "Wallet not found" };

    const current = wallet[balance_type] || 0;
    const updates: any = {};
    updates[balance_type] = current + Number(amount);
    // Also update total balance if modifying sub-balances
    if (balance_type !== 'balance') {
       updates.balance = (wallet.balance || 0) + Number(amount);
    }

    const { error } = await supabase.from('wallets').update(updates).eq('user_id', user.id);
    if (error) return { error: error.message };
    return { result: `Balance adjusted by ${amount}. New ${balance_type}: ${updates[balance_type]}` };
  },

  manage_system_config: async ({ action, key, value }: any) => {
    // Helper for system_config or daily_bonus_config
    if (action === 'update_bonus') {
       const { error } = await supabase.from('daily_bonus_config').update({ reward_amount: Number(value) }).eq('day', Number(key));
       if (error) return { error: error.message };
       return { result: `Updated Day ${key} bonus to ${value}` };
    }
    
    if (action === 'system_setting') {
       const updates: any = {};
       
       // Robust value parsing
       let parsedValue = value;
       try {
          if (value === 'true') parsedValue = true;
          else if (value === 'false') parsedValue = false;
          else if (!isNaN(Number(value)) && value.trim() !== '') parsedValue = Number(value);
          else if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
             parsedValue = JSON.parse(value);
          }
       } catch (e) {
          // Fallback to string if parsing fails
          parsedValue = value;
       }

       updates[key] = parsedValue;
       const { error } = await supabase.from('system_config').update(updates).neq('id', '0000'); // update all
       if (error) return { error: error.message };
       return { result: `System config '${key}' set to ${value}` };
    }
    return { error: "Unknown action" };
  }
};

// --- Tool Definitions (Schema) ---

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "read_table",
      description: "Read rows from a database table.",
      parameters: {
        type: "object",
        properties: {
          table_name: { type: "string", description: `Table to read. Options: ${ALL_TABLES.join(', ')}` },
          limit: { type: "number", description: "Number of rows to fetch (default 10)" }
        },
        required: ["table_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_database",
      description: "Search for records in a specific table.",
      parameters: {
        type: "object",
        properties: {
          table_name: { type: "string" },
          column: { type: "string" },
          value: { type: "string" }
        },
        required: ["table_name", "column", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_details",
      description: "Get full user profile and wallet information.",
      parameters: {
        type: "object",
        properties: { identifier: { type: "string", description: "Email or User ID" } },
        required: ["identifier"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_record",
      description: "Update a database row directly.",
      parameters: {
        type: "object",
        properties: {
          table_name: { type: "string" },
          id_column: { type: "string" },
          id_value: { type: "string" },
          updates_json: { type: "string", description: "JSON string of fields to update" }
        },
        required: ["table_name", "id_column", "id_value", "updates_json"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "suspend_user",
      description: "Suspend/Block a user account instantly.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string" },
          reason: { type: "string" }
        },
        required: ["email", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "activate_user",
      description: "Unsuspend/Activate a user account.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string" }
        },
        required: ["email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "insert_record",
      description: "Insert a new database row.",
      parameters: {
        type: "object",
        properties: {
          table_name: { type: "string" },
          data_json: { type: "string" }
        },
        required: ["table_name", "data_json"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_support_ticket",
      description: "Create a formal help request/ticket for complex issues.",
      parameters: {
        type: "object",
        properties: {
          user_email: { type: "string" },
          issue_description: { type: "string" },
          priority: { type: "string" }
        },
        required: ["user_email", "issue_description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "admin_adjust_balance",
      description: "Add or remove funds from a user's wallet.",
      parameters: {
        type: "object",
        properties: {
          user_email: { type: "string" },
          amount: { type: "number", description: "Positive to add, negative to deduct" },
          balance_type: { type: "string", description: "main_balance, deposit_balance, etc." }
        },
        required: ["user_email", "amount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "manage_system_config",
      description: "Manage system settings or daily rewards.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "'update_bonus' for daily rewards, 'system_setting' for global config" },
          key: { type: "string", description: "Day number (for bonus) or Column name (for system)" },
          value: { type: "string", description: "New value" }
        },
        required: ["action", "key", "value"]
      }
    }
  }
];

// --- Execution Helper ---

export const executeTool = async (name: string, args: any) => {
  if (toolsFuncs[name as keyof typeof toolsFuncs]) {
    try {
      return await toolsFuncs[name as keyof typeof toolsFuncs](args);
    } catch (e: any) {
      return { error: `Execution Exception: ${e.message}` };
    }
  }
  return { error: `Tool '${name}' not implemented.` };
};
