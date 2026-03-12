import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gskufvyviaxetkwrhsgn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdza3Vmdnl2aWF4ZXRrd3Joc2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjA1NTUsImV4cCI6MjA4ODczNjU1NX0.VmK75_KWJ7xVjxAovEZakfnWu2yBW1uGfJHvKAdHinU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
