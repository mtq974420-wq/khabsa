// =============================================
// CORE TYPES FOR KHABSA PLATFORM
// =============================================

export type GameType = 
  | 'meen_barra_salfa'
  | 'meen_atrash'
  | 'meen_barra_rasma'
  | 'meen_ghalban'
  | 'mamnoo3_tahki'
  | 'tahadi_soraa'
  | 'irsom_w_khamen';

export type GameStatus = 'waiting' | 'in_progress' | 'finished' | 'paused';
export type RoomStatus = 'lobby' | 'in_game' | 'finished';
export type PlayerStatus = 'connected' | 'disconnected' | 'away';
export type UserRole = 'guest' | 'user' | 'admin';
export type MessageType = 'text' | 'system' | 'emoji';

// =============================================
// USER & PROFILE
// =============================================

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  avatar_color: string;
  avatar_emoji: string;
  role: UserRole;
  is_guest: boolean;
  total_games: number;
  total_wins: number;
  total_points: number;
  achievements: string[];
  friends: string[];
  created_at: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  avatar_emoji: string;
  total_points: number;
  total_wins: number;
  is_guest: boolean;
}

// =============================================
// ROOM
// =============================================

export interface Room {
  id: string;
  code: string;
  name: string;
  host_id: string;
  status: RoomStatus;
  game_type: GameType | null;
  max_players: number;
  is_private: boolean;
  password: string | null;
  current_game_id: string | null;
  settings: RoomSettings;
  created_at: string;
  updated_at: string;
}

export interface RoomSettings {
  rounds: number;
  round_duration: number;
  voting_duration: number;
  allow_spectators: boolean;
  auto_start: boolean;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  avatar_color: string;
  avatar_emoji: string;
  is_host: boolean;
  is_ready: boolean;
  is_spectator: boolean;
  status: PlayerStatus;
  score: number;
  joined_at: string;
  profile?: PlayerProfile;
}

// =============================================
// GAME
// =============================================

export interface GameSession {
  id: string;
  room_id: string;
  game_type: GameType;
  status: GameStatus;
  current_round: number;
  total_rounds: number;
  round_start_time: string | null;
  round_end_time: string | null;
  game_data: Record<string, unknown>;
  scores: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface GameQuestion {
  id: string;
  game_type: GameType;
  category: string;
  content: string;
  content_en?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  is_active: boolean;
}

export interface SecretWord {
  id: string;
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
}

export interface QuestionPair {
  id: string;
  game_type: GameType;
  common_question: string;
  outsider_question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
}

export interface PicturePair {
  id: string;
  common_image_url: string;
  outsider_image_url: string;
  common_description: string;
  outsider_description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
}

// =============================================
// CHAT
// =============================================

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  avatar_color: string;
  avatar_emoji: string;
  content: string;
  type: MessageType;
  created_at: string;
}

// =============================================
// VOICE CHAT
// =============================================

export interface VoiceParticipant {
  user_id: string;
  display_name: string;
  is_muted: boolean;
  is_speaking: boolean;
  volume: number;
  peer_id?: string;
}

// =============================================
// ACHIEVEMENTS
// =============================================

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: Record<string, unknown>;
}

// =============================================
// LEADERBOARD
// =============================================

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_color: string;
  avatar_emoji: string;
  total_points: number;
  total_wins: number;
  total_games: number;
  win_rate: number;
}

// =============================================
// GAME-SPECIFIC TYPES
// =============================================

// Game 1: مين برا السالفة؟
export interface MeenBarraSalfaState {
  secret_word: string;
  outsider_id: string;
  phase: 'discussion' | 'voting' | 'reveal';
  votes: Record<string, string>;
  timer: number;
  round_winner: string | null;
}

// Game 2: مين الأطرش؟
export interface MeenAtrashState {
  common_question: string;
  outsider_question: string;
  outsider_id: string;
  answers: Record<string, string>;
  phase: 'answering' | 'discussion' | 'voting' | 'reveal';
  votes: Record<string, string>;
  timer: number;
}

// Game 3: مين برا الرسمة؟
export interface MeenBarraRasmaState {
  common_image_url: string;
  outsider_image_url: string;
  outsider_id: string;
  descriptions: Record<string, string>;
  phase: 'describing' | 'discussion' | 'voting' | 'reveal';
  votes: Record<string, string>;
  timer: number;
}

// Game 4: مين غالباً؟
export interface MeenGhalbanState {
  question: string;
  votes: Record<string, string>;
  phase: 'voting' | 'reveal';
  timer: number;
  winner_id: string | null;
  vote_counts: Record<string, number>;
}

// Game 5: ممنوع تحكي!
export interface Mamnoo3State {
  current_team: 'a' | 'b';
  teams: { a: string[]; b: string[] };
  current_explainer_id: string;
  current_word: string;
  forbidden_words: string[];
  phase: 'explaining' | 'guessing' | 'results';
  timer: number;
  team_scores: { a: number; b: number };
  current_round_points: { a: number; b: number };
  skips_remaining: number;
  words_queue: Array<{ word: string; forbidden: string[] }>;
  guessed_words: string[];
}

// Game 6: تحدي السرعة
export interface TahadiState {
  question: string;
  options: string[];
  correct_answer: string;
  phase: 'question' | 'reveal';
  timer: number;
  answers: Record<string, { answer: string; time: number }>;
  scores_this_round: Record<string, number>;
  total_questions: number;
  current_question_index: number;
  questions_answered: number;
}

// Game 7: ارسم وخمّن
export interface IrsomState {
  current_drawer_id: string;
  secret_word: string;
  canvas_data: DrawAction[];
  phase: 'drawing' | 'guessing' | 'reveal';
  timer: number;
  guesses: Record<string, string>;
  correct_guessers: Array<{ user_id: string; time: number; points: number }>;
  drawer_points: number;
  hints: string[];
  hint_level: number;
}

export interface DrawAction {
  type: 'draw' | 'clear' | 'fill';
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  color?: string;
  size?: number;
  points?: Array<[number, number]>;
}

// =============================================
// REALTIME EVENTS
// =============================================

export type RealtimeEventType = 
  | 'player_joined'
  | 'player_left'
  | 'player_ready'
  | 'game_started'
  | 'game_state_update'
  | 'player_action'
  | 'chat_message'
  | 'voice_signal'
  | 'host_changed'
  | 'room_updated'
  | 'round_ended'
  | 'game_ended'
  | 'kick_player';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  user_id: string;
  timestamp: string;
}

// =============================================
// API RESPONSES
// =============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
