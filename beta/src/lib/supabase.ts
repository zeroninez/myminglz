// Re-export for backward compatibility
export { createClient } from './supabase/client'

import { createBrowserClient } from '@supabase/ssr'

// Legacy client (for direct usage in client components)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
