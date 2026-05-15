import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hpagzlvvtwsuyxdiudfv.supabase.co'
const supabaseKey = 'sb_publishable_z95R2ryCtLTvmIRJZmeRSg_D149byVX'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)