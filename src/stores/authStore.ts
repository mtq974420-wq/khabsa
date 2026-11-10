import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { generateGuestName, generateId, getRandomAvatarColor, getRandomAvatarEmoji } from '@/lib/utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isLoading: boolean
  isGuest: boolean
  
  // Actions
  loginAsGuest: (displayName?: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isGuest: false,

      loginAsGuest: async (displayName?: string) => {
        set({ isLoading: true })
        
        const guestUser: User = {
          id: `guest_${generateId()}`,
          username: displayName || generateGuestName(),
          display_name: displayName || generateGuestName(),
          avatar_url: null,
          avatar_color: getRandomAvatarColor(),
          avatar_emoji: getRandomAvatarEmoji(),
          role: 'guest',
          is_guest: true,
          total_games: 0,
          total_wins: 0,
          total_points: 0,
          achievements: [],
          friends: [],
          created_at: new Date().toISOString(),
        }
        
        set({ user: guestUser, isGuest: true, isLoading: false })
      },

      loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true })
        
        if (!isSupabaseConfigured()) {
          // Demo mode without Supabase
          const demoUser: User = {
            id: `user_${generateId()}`,
            username: email.split('@')[0],
            display_name: email.split('@')[0],
            avatar_url: null,
            avatar_color: getRandomAvatarColor(),
            avatar_emoji: getRandomAvatarEmoji(),
            role: 'user',
            is_guest: false,
            total_games: 0,
            total_wins: 0,
            total_points: 0,
            achievements: [],
            friends: [],
            created_at: new Date().toISOString(),
          }
          set({ user: demoUser, isGuest: false, isLoading: false })
          return
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          
          if (data.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (profile) {
              set({ user: profile as User, isGuest: false, isLoading: false })
            }
          }
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      registerWithEmail: async (email: string, password: string, username: string) => {
        set({ isLoading: true })
        
        if (!isSupabaseConfigured()) {
          const demoUser: User = {
            id: `user_${generateId()}`,
            username,
            display_name: username,
            avatar_url: null,
            avatar_color: getRandomAvatarColor(),
            avatar_emoji: getRandomAvatarEmoji(),
            role: 'user',
            is_guest: false,
            total_games: 0,
            total_wins: 0,
            total_points: 0,
            achievements: [],
            friends: [],
            created_at: new Date().toISOString(),
          }
          set({ user: demoUser, isGuest: false, isLoading: false })
          return
        }

        try {
          const { data, error } = await supabase.auth.signUp({ email, password })
          if (error) throw error
          
          if (data.user) {
            const newUser: Partial<User> = {
              id: data.user.id,
              username,
              display_name: username,
              avatar_url: null,
              avatar_color: getRandomAvatarColor(),
              avatar_emoji: getRandomAvatarEmoji(),
              role: 'user',
              is_guest: false,
              total_games: 0,
              total_wins: 0,
              total_points: 0,
              achievements: [],
              friends: [],
            }
            
            await supabase.from('users').insert(newUser)
            set({ user: newUser as User, isGuest: false, isLoading: false })
          }
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: async () => {
        if (isSupabaseConfigured()) {
          await supabase.auth.signOut()
        }
        set({ user: null, isGuest: false })
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get()
        if (!user) return
        
        const updatedUser = { ...user, ...updates }
        set({ user: updatedUser })
        
        if (isSupabaseConfigured() && !user.is_guest) {
          await supabase.from('users').update(updates).eq('id', user.id)
        }
      },

      loadUser: async () => {
        if (!isSupabaseConfigured()) return
        
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (profile) {
            set({ user: profile as User, isGuest: false })
          }
        }
      },
    }),
    {
      name: 'khabsa-auth',
      partialize: (state) => ({ user: state.user, isGuest: state.isGuest }),
    }
  )
)
