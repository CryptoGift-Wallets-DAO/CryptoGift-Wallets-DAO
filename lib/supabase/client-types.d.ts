/**
 * 🔧 Supabase RPC TypeScript Fix
 * 
 * Custom type definitions to fix "Argument of type is not assignable to parameter of type 'never'"
 * Source: https://github.com/supabase/postgrest-js/issues/420
 */

import { PostgrestBuilder } from '@supabase/postgrest-js'
import { SupabaseClient } from '@supabase/supabase-js'

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<ResponseType = any, ParamsType = any>(
      fn: string,
      params?: ParamsType
    ): PostgrestBuilder<ResponseType>
  }
}