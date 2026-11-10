/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
// Supports both legacy anon JWT keys and new sb_publishable_xxx format
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isConfigured =
  supabaseUrl !== '' &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'PASTE_YOUR_ANON_KEY_HERE'

if (isConfigured) {
  console.log('✅ Supabase connected:', supabaseUrl)
} else {
  console.warn('⚠️ Supabase not configured — running in local demo mode')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
    global: {
      headers: {
        // For new-format publishable keys, still send as apikey header
        // supabase-js 2.x handles this automatically
      },
    },
  }
)

export const isSupabaseConfigured = () => isConfigured

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          avatar_color: string
          avatar_emoji: string
          role: string
          is_guest: boolean
          total_games: number
          total_wins: number
          total_points: number
          achievements: string[]
          friends: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      rooms: {
        Row: {
          id: string
          code: string
          name: string
          host_id: string
          status: string
          game_type: string | null
          max_players: number
          is_private: boolean
          password: string | null
          current_game_id: string | null
          settings: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      room_players: {
        Row: {
          id: string
          room_id: string
          user_id: string
          display_name: string
          avatar_color: string
          avatar_emoji: string
          is_host: boolean
          is_ready: boolean
          is_spectator: boolean
          status: string
          score: number
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['room_players']['Row'], never>
        Update: Partial<Database['public']['Tables']['room_players']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          display_name: string
          avatar_color: string
          avatar_emoji: string
          content: string
          type: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], never>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
    }
  }
}
