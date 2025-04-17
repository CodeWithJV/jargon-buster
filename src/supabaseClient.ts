import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucnwhgvfvtdfcbumvffx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbndoZ3ZmdnRkZmNidW12ZmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NTUwMDQsImV4cCI6MjA2MDQzMTAwNH0.Z3sSy142yK_isdUUdNfRIjWABQDpQ9Mp933p6CnUar8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
