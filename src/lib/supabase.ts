import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          body: string
          color: string
          labels: string[]
          pinned: boolean
          archived: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title?: string
          body?: string
          color?: string
          labels?: string[]
          pinned?: boolean
          archived?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          color?: string
          labels?: string[]
          pinned?: boolean
          archived?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
}

export type Note = Database['public']['Tables']['notes']['Row']