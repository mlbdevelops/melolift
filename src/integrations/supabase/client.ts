
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oegfqqszjfnfyqvdyosh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ2ZxcXN6amZuZnlxdmR5b3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTU1MjUsImV4cCI6MjA1ODQ5MTUyNX0.oyCEHwbzD-CTLHHm5aMxq_tVCSzz6vI-1zJjwtm5Lbs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
