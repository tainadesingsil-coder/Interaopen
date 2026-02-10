import { createClient } from "@supabase/supabase-js";
import type { HookflowLeadRow } from "@/lib/hookflow/types";

type HookflowInsert = Omit<HookflowLeadRow, "id" | "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

type HookflowUpdate = Partial<HookflowInsert>;

interface HookflowDatabase {
  public: {
    Tables: {
      hookflow_leads: {
        Row: HookflowLeadRow;
        Insert: HookflowInsert;
        Update: HookflowUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export const HOOKFLOW_LEADS_TABLE = "hookflow_leads";

export const hasSupabaseCredentials = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<HookflowDatabase>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
