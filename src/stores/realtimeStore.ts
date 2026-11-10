/**
 * KHABSA Realtime Store
 * Handles cross-browser room synchronization via Supabase Realtime
 * Falls back to local state when Supabase is not configured
 */
import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

type EventHandler = (payload: Record<string, unknown>) => void

interface RealtimeState {
  channels: Map<string, RealtimeChannel>
  
  // Subscribe to a room channel
  subscribeToRoom: (
    roomId: string,
    handlers: {
      onPlayerJoined?: EventHandler
      onPlayerLeft?: EventHandler
      onGameStarted?: EventHandler
      onGameStateUpdate?: EventHandler
      onRoomUpdated?: EventHandler
      onChatMessage?: EventHandler
    }
  ) => () => void
  
  // Broadcast an event to a room
  broadcast: (roomId: string, event: string, payload: Record<string, unknown>) => Promise<void>
  
  // Unsubscribe from a room
  unsubscribeFromRoom: (roomId: string) => void
}

export const useRealtimeStore = create<RealtimeState>()((set, get) => ({
  channels: new Map(),

  subscribeToRoom: (roomId, handlers) => {
    if (!isSupabaseConfigured()) {
      // No Supabase — return no-op
      return () => {}
    }

    const channelName = `room:${roomId}`
    
    // Don't duplicate subscriptions
    if (get().channels.has(channelName)) {
      return () => get().unsubscribeFromRoom(channelName)
    }

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: '' },
      },
    })

    // Listen for broadcast events
    if (handlers.onPlayerJoined) {
      channel.on('broadcast', { event: 'player_joined' }, ({ payload }) => {
        handlers.onPlayerJoined?.(payload)
      })
    }
    if (handlers.onPlayerLeft) {
      channel.on('broadcast', { event: 'player_left' }, ({ payload }) => {
        handlers.onPlayerLeft?.(payload)
      })
    }
    if (handlers.onGameStarted) {
      channel.on('broadcast', { event: 'game_started' }, ({ payload }) => {
        handlers.onGameStarted?.(payload)
      })
    }
    if (handlers.onGameStateUpdate) {
      channel.on('broadcast', { event: 'game_state_update' }, ({ payload }) => {
        handlers.onGameStateUpdate?.(payload)
      })
    }
    if (handlers.onRoomUpdated) {
      channel.on('broadcast', { event: 'room_updated' }, ({ payload }) => {
        handlers.onRoomUpdated?.(payload)
      })
    }
    if (handlers.onChatMessage) {
      channel.on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        handlers.onChatMessage?.(payload)
      })
    }

    // Also listen for DB changes
    channel
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            handlers.onRoomUpdated?.(payload.new as Record<string, unknown>)
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          handlers.onChatMessage?.(payload.new as Record<string, unknown>)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Realtime connected to room: ${roomId}`)
        }
      })

    const channels = get().channels
    channels.set(channelName, channel)
    set({ channels })

    return () => get().unsubscribeFromRoom(channelName)
  },

  broadcast: async (roomId, event, payload) => {
    if (!isSupabaseConfigured()) return
    
    const channelName = `room:${roomId}`
    const channel = get().channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      })
    }
  },

  unsubscribeFromRoom: (channelName) => {
    const channel = get().channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      const channels = get().channels
      channels.delete(channelName)
      set({ channels })
    }
  },
}))
