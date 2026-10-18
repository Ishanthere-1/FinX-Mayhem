import {createClient} from '@supabase/supabase-js'

const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co'
const SUPABASE_KEY = 'YOUR-ANON-OR-PUBLISHABLE-KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
