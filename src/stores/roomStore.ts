import { create } from 'zustand'
import { Room, RoomPlayer, ChatMessage, GameSession } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { generateRoomCode, generateId } from '@/lib/utils'
import { DEFAULT_ROOM_SETTINGS } from '@/lib/constants'

interface RoomState {
  room: Room | null
  players: RoomPlayer[]
  messages: ChatMessage[]
  gameSession: GameSession | null
  isConnecting: boolean
  error: string | null
  localRooms: Map<string, { room: Room; players: RoomPlayer[] }>

  createRoom: (hostId: string, hostName: string, avatarColor: string, avatarEmoji: string, options?: Partial<Room>) => Promise<Room>
  joinRoom: (code: string, userId: string, displayName: string, avatarColor: string, avatarEmoji: string) => Promise<Room>
  leaveRoom: () => Promise<void>
  updateRoomSettings: (settings: Partial<Room['settings']>) => Promise<void>
  setReady: (userId: string, isReady: boolean) => void
  kickPlayer: (playerId: string) => Promise<void>
  startGame: (gameType: string) => Promise<void>
  sendMessage: (userId: string, displayName: string, avatarColor: string, avatarEmoji: string, content: string) => void
  updateGameSession: (updates: Partial<GameSession>) => void
  subscribeToRoom: (roomId: string) => () => void
  setError: (error: string | null) => void
  transferHost: (newHostId: string) => void
  refreshPlayers: (roomId: string) => Promise<void>
}

export const useRoomStore = create<RoomState>()((set, get) => ({
  room: null,
  players: [],
  messages: [],
  gameSession: null,
  isConnecting: false,
  error: null,
  localRooms: new Map(),

  createRoom: async (hostId, hostName, avatarColor, avatarEmoji, options = {}) => {
    set({ isConnecting: true, error: null })

    const code = generateRoomCode()
    const roomId = generateId()

    const room: Room = {
      id: roomId,
      code,
      name: options.name || `غرفة ${hostName}`,
      host_id: hostId,
      status: 'lobby',
      game_type: null,
      max_players: options.max_players || 8,
      is_private: options.is_private ?? true,
      password: options.password || null,
      current_game_id: null,
      settings: { ...DEFAULT_ROOM_SETTINGS, ...options.settings },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const hostPlayer: RoomPlayer = {
      id: generateId(),
      room_id: roomId,
      user_id: hostId,
      display_name: hostName,
      avatar_color: avatarColor,
      avatar_emoji: avatarEmoji,
      is_host: true,
      is_ready: false,
      is_spectator: false,
      status: 'connected',
      score: 0,
      joined_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      const { error: roomErr } = await supabase.from('rooms').insert(room)
      if (roomErr) {
        console.error('Room insert error:', roomErr)
        set({ isConnecting: false, error: 'فشل إنشاء الغرفة: ' + roomErr.message })
        throw new Error(roomErr.message)
      }
      const { error: playerErr } = await supabase.from('room_players').insert(hostPlayer)
      if (playerErr) console.error('Player insert error:', playerErr)
    } else {
      const localRooms = get().localRooms
      localRooms.set(code, { room, players: [hostPlayer] })
      set({ localRooms })
    }

    const systemMsg: ChatMessage = {
      id: generateId(),
      room_id: roomId,
      user_id: 'system',
      display_name: 'النظام',
      avatar_color: '#7c3aed',
      avatar_emoji: '🎮',
      content: `أُنشئت الغرفة بكود: ${code}`,
      type: 'system',
      created_at: new Date().toISOString(),
    }

    set({
      room,
      players: [hostPlayer],
      messages: [systemMsg],
      gameSession: null,
      isConnecting: false,
    })

    return room
  },

  joinRoom: async (code, userId, displayName, avatarColor, avatarEmoji) => {
    set({ isConnecting: true, error: null })

    let room: Room | null = null
    let players: RoomPlayer[] = []

    if (isSupabaseConfigured()) {
      const { data: roomData, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (error || !roomData) {
        set({ isConnecting: false, error: 'الغرفة مش موجودة' })
        throw new Error('الغرفة مش موجودة')
      }

      room = roomData as Room

      const { data: playersData } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id)

      players = (playersData || []) as RoomPlayer[]
    } else {
      const localRooms = get().localRooms
      const localRoom = localRooms.get(code.toUpperCase())
      if (!localRoom) {
        set({ isConnecting: false, error: 'الغرفة مش موجودة' })
        throw new Error('الغرفة مش موجودة')
      }
      room = localRoom.room
      players = localRoom.players
    }

    if (players.length >= room.max_players) {
      set({ isConnecting: false, error: 'الغرفة ممتلئة' })
      throw new Error('الغرفة ممتلئة')
    }

    const existingPlayer = players.find(p => p.user_id === userId)
    if (existingPlayer) {
      if (isSupabaseConfigured()) {
        await supabase
          .from('room_players')
          .update({ status: 'connected' })
          .eq('room_id', room.id)
          .eq('user_id', userId)
      }
      const updatedPlayers = players.map(p =>
        p.user_id === userId ? { ...p, status: 'connected' as const } : p
      )
      set({ room, players: updatedPlayers, isConnecting: false })
      return room
    }

    const newPlayer: RoomPlayer = {
      id: generateId(),
      room_id: room.id,
      user_id: userId,
      display_name: displayName,
      avatar_color: avatarColor,
      avatar_emoji: avatarEmoji,
      is_host: false,
      is_ready: false,
      is_spectator: false,
      status: 'connected',
      score: 0,
      joined_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      await supabase.from('room_players').insert(newPlayer)
    } else {
      const localRooms = get().localRooms
      const localRoom = localRooms.get(code.toUpperCase())
      if (localRoom) {
        localRoom.players.push(newPlayer)
        localRooms.set(code.toUpperCase(), localRoom)
        set({ localRooms })
      }
    }

    const updatedPlayers = [...players, newPlayer]
    const joinMsg: ChatMessage = {
      id: generateId(),
      room_id: room.id,
      user_id: 'system',
      display_name: 'النظام',
      avatar_color: '#7c3aed',
      avatar_emoji: '🎮',
      content: `${displayName} انضم للغرفة 🎉`,
      type: 'system',
      created_at: new Date().toISOString(),
    }

    set({ room, players: updatedPlayers, messages: [joinMsg], isConnecting: false })
    return room
  },

  leaveRoom: async () => {
    const { room, players } = get()
    if (!room) return

    const currentUserId = players.find(p => p.is_host === false)?.user_id

    if (isSupabaseConfigured() && currentUserId) {
      await supabase
        .from('room_players')
        .update({ status: 'disconnected' })
        .eq('room_id', room.id)
        .eq('user_id', currentUserId)
    }

    set({ room: null, players: [], messages: [], gameSession: null })
  },

  updateRoomSettings: async (settings) => {
    const { room } = get()
    if (!room) return
    const updatedRoom = {
      ...room,
      settings: { ...room.settings, ...settings },
      updated_at: new Date().toISOString(),
    }
    set({ room: updatedRoom })
    if (isSupabaseConfigured()) {
      await supabase.from('rooms').update({ settings: updatedRoom.settings }).eq('id', room.id)
    }
  },

  setReady: (userId, isReady) => {
    set(state => ({
      players: state.players.map(p =>
        p.user_id === userId ? { ...p, is_ready: isReady } : p
      ),
    }))
    const { room } = get()
    if (isSupabaseConfigured() && room) {
      supabase
        .from('room_players')
        .update({ is_ready: isReady })
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .then(() => {})
    }
  },

  kickPlayer: async (playerId) => {
    const { room, players } = get()
    if (!room) return
    set({ players: players.filter(p => p.user_id !== playerId) })
    if (isSupabaseConfigured()) {
      await supabase
        .from('room_players')
        .delete()
        .eq('user_id', playerId)
        .eq('room_id', room.id)
    }
  },

  startGame: async (gameType) => {
    const { room } = get()
    if (!room) return

    const gameSession: GameSession = {
      id: generateId(),
      room_id: room.id,
      game_type: gameType as GameSession['game_type'],
      status: 'in_progress',
      current_round: 1,
      total_rounds: room.settings.rounds,
      round_start_time: new Date().toISOString(),
      round_end_time: null,
      game_data: {},
      scores: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedRoom = {
      ...room,
      status: 'in_game' as const,
      game_type: gameType as Room['game_type'],
    }

    set({ room: updatedRoom, gameSession })

    if (isSupabaseConfigured()) {
      await supabase
        .from('rooms')
        .update({ status: 'in_game', game_type: gameType })
        .eq('id', room.id)
      await supabase.from('game_sessions').insert(gameSession)
    }
  },

  sendMessage: (userId, displayName, avatarColor, avatarEmoji, content) => {
    const { room } = get()
    if (!room) return

    const message: ChatMessage = {
      id: generateId(),
      room_id: room.id,
      user_id: userId,
      display_name: displayName,
      avatar_color: avatarColor,
      avatar_emoji: avatarEmoji,
      content,
      type: 'text',
      created_at: new Date().toISOString(),
    }

    set(state => ({ messages: [...state.messages, message] }))

    if (isSupabaseConfigured()) {
      supabase.from('chat_messages').insert(message).then(() => {})
    }
  },

  updateGameSession: (updates) => {
    set(state => ({
      gameSession: state.gameSession ? { ...state.gameSession, ...updates } : null,
    }))
  },

  subscribeToRoom: (roomId) => {
    if (!isSupabaseConfigured()) return () => {}

    // Use Supabase Broadcast channel for real-time sync
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('broadcast', { event: 'player_update' }, ({ payload }) => {
        if (payload.players) {
          set({ players: payload.players as RoomPlayer[] })
        }
      })
      .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        if (payload.message) {
          set(state => ({
            messages: [...state.messages, payload.message as ChatMessage],
          }))
        }
      })
      .on('broadcast', { event: 'game_started' }, ({ payload }) => {
        if (payload.room && payload.gameSession) {
          set({
            room: payload.room as Room,
            gameSession: payload.gameSession as GameSession,
          })
        }
      })
      .on('broadcast', { event: 'room_update' }, ({ payload }) => {
        if (payload.room) {
          set({ room: payload.room as Room })
        }
      })
      // Also poll for player changes every 3 seconds as fallback
      .subscribe()

    // Polling fallback for players (since Postgres realtime needs JWT)
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
      if (data && data.length > 0) {
        set({ players: data as RoomPlayer[] })
      }
    }, 3000)

    // Also poll for chat messages
    let lastMsgTime = new Date().toISOString()
    const chatPoll = setInterval(async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .gt('created_at', lastMsgTime)
        .order('created_at', { ascending: true })
      if (data && data.length > 0) {
        lastMsgTime = data[data.length - 1].created_at
        set(state => ({
          messages: [
            ...state.messages,
            ...data.filter(m => !state.messages.find(sm => sm.id === m.id)) as ChatMessage[],
          ],
        }))
      }
    }, 1500)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      clearInterval(chatPoll)
    }
  },

  refreshPlayers: async (roomId) => {
    if (!isSupabaseConfigured()) return
    const { data } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
    if (data) set({ players: data as RoomPlayer[] })
  },

  setError: (error) => set({ error }),

  transferHost: (newHostId) => {
    set(state => ({
      room: state.room ? { ...state.room, host_id: newHostId } : null,
      players: state.players.map(p => ({
        ...p,
        is_host: p.user_id === newHostId,
      })),
    }))
  },
}))
