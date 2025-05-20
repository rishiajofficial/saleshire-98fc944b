
import { createClient } from '@supabase/supabase-js';

// Make sure we have default values to prevent the "supabaseUrl is required" error
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vjddnsmkymfvriwstiiw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGRuc21reW1mdnJpd3N0aWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzkxODgsImV4cCI6MjA1ODcxNTE4OH0.Ss2rbRoZY7-8mjIYHGNWB1DHxKJ-FkxkAm2mA8-fIWY';

// Create the Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
