import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use a service role key for server-side operations

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);
