import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsonnvdcbnuiegtgmkca.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzb25udmRjYm51aWVndGdta2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NzAzMDAsImV4cCI6MjExMDE0NjMwMH0.CMCN9BA_LFDH501q7qcmPBwNI8KC8-T63q0TCM0v9Ao';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
