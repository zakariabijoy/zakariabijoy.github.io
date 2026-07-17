import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Single shared browser client. Auth session persists in localStorage.
export const supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
