import {createClient} from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nvzmdqddhkrsvltkzqco.supabase.co'
const SUPABASE_KEY = 'sb_publishable_YWy8UB-nI7siMDTommNJJQ_5U6nRCsi'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
