import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zuhbtivatfaxxbuilltj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGJ0aXZhdGZheHhidWlsbHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NzkwNDksImV4cCI6MjEwMzU1NTA0OX0.WcnHZLuWMpZYj5PReyiMgvwSx46DRAlvl99o0SmQtAk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
