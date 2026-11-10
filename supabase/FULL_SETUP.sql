-- ============================================================
-- KHABSA Platform - Database Schema
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  avatar_color TEXT NOT NULL DEFAULT '#7c3aed',
  avatar_emoji TEXT NOT NULL DEFAULT '🎮',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin')),
  is_guest BOOLEAN NOT NULL DEFAULT false,
  total_games INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  friends UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_game', 'finished')),
  game_type TEXT CHECK (game_type IN (
    'meen_barra_salfa', 'meen_atrash', 'meen_barra_rasma',
    'meen_ghalban', 'mamnoo3_tahki', 'tahadi_soraa', 'irsom_w_khamen'
  )),
  max_players INTEGER NOT NULL DEFAULT 8,
  is_private BOOLEAN NOT NULL DEFAULT true,
  password TEXT,
  current_game_id UUID,
  settings JSONB NOT NULL DEFAULT '{
    "rounds": 5,
    "round_duration": 60,
    "voting_duration": 30,
    "allow_spectators": true,
    "auto_start": false
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROOM PLAYERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.room_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#7c3aed',
  avatar_emoji TEXT NOT NULL DEFAULT '🎮',
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  is_spectator BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'away')),
  score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- ============================================================
-- GAME SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished', 'paused')),
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 5,
  round_start_time TIMESTAMPTZ,
  round_end_time TIMESTAMPTZ,
  game_data JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CHAT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#7c3aed',
  avatar_emoji TEXT NOT NULL DEFAULT '🎮',
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'system', 'emoji')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECRET WORDS TABLE (for مين برا السالفة؟)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.secret_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- QUESTION PAIRS TABLE (for مين الأطرش؟)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.question_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type TEXT NOT NULL,
  common_question TEXT NOT NULL,
  outsider_question TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIVIA QUESTIONS TABLE (for تحدي السرعة)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trivia_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DRAW WORDS TABLE (for ارسم وخمّن)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.draw_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- FORBIDDEN WORD CARDS (for ممنوع تحكي)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.forbidden_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  forbidden_words JSONB NOT NULL DEFAULT '[]',
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  condition JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================
-- USER ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_host ON public.rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON public.room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_user ON public.room_players(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room ON public.game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read all users, update their own
CREATE POLICY "Users are readable by all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Rooms readable by all, managed by host
CREATE POLICY "Rooms are readable by all" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Rooms insertable by authenticated" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Rooms updatable by host" ON public.rooms FOR UPDATE USING (auth.uid() = host_id);

-- Room players readable by all
CREATE POLICY "Room players readable" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Room players insertable" ON public.room_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Room players updatable by self" ON public.room_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Room players deletable by self or host" ON public.room_players FOR DELETE USING (auth.uid() = user_id);

-- Chat messages
CREATE POLICY "Chat messages readable" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Chat messages insertable" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Game sessions readable by all
CREATE POLICY "Game sessions readable" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Game sessions manageable" ON public.game_sessions FOR ALL USING (true);
-- ============================================================
-- KHABSA Seed Data
-- ============================================================

-- ============================================================
-- SECRET WORDS (مين برا السالفة؟)
-- ============================================================
INSERT INTO public.secret_words (word, category, difficulty) VALUES
  ('بيتزا', 'طعام', 'easy'),
  ('كنافة', 'طعام', 'easy'),
  ('منسف', 'طعام', 'medium'),
  ('فلافل', 'طعام', 'easy'),
  ('شاورما', 'طعام', 'easy'),
  ('مسخن', 'طعام', 'medium'),
  ('قهوة', 'مشروبات', 'easy'),
  ('شاي', 'مشروبات', 'easy'),
  ('كرة قدم', 'رياضة', 'easy'),
  ('سباحة', 'رياضة', 'easy'),
  ('ملاكمة', 'رياضة', 'medium'),
  ('مطار', 'أماكن', 'easy'),
  ('شاطئ', 'أماكن', 'easy'),
  ('مستشفى', 'أماكن', 'easy'),
  ('سوق', 'أماكن', 'easy'),
  ('مدرسة', 'أماكن', 'easy'),
  ('أسد', 'حيوانات', 'easy'),
  ('فيل', 'حيوانات', 'easy'),
  ('دلفين', 'حيوانات', 'medium'),
  ('طبيب', 'مهن', 'easy'),
  ('معلم', 'مهن', 'easy'),
  ('مهندس', 'مهن', 'easy'),
  ('طيار', 'مهن', 'medium'),
  ('هاتف', 'تقنية', 'easy'),
  ('سيارة', 'مواصلات', 'easy'),
  ('طيارة', 'مواصلات', 'easy'),
  ('سينما', 'ترفيه', 'easy'),
  ('موسيقى', 'ترفيه', 'easy'),
  ('كتاب', 'ترفيه', 'easy');

-- ============================================================
-- TRIVIA QUESTIONS (تحدي السرعة)
-- ============================================================
INSERT INTO public.trivia_questions (question, options, correct_answer, category, difficulty) VALUES
  ('ما هي عاصمة المملكة العربية السعودية؟', '["الرياض","جدة","مكة","المدينة"]', 'الرياض', 'جغرافيا', 'easy'),
  ('كم عدد أيام الأسبوع؟', '["5","6","7","8"]', '7', 'عام', 'easy'),
  ('ما هو أكبر محيط في العالم؟', '["الأطلسي","الهادئ","الهندي","المتجمد"]', 'الهادئ', 'جغرافيا', 'medium'),
  ('من كتب روميو وجولييت؟', '["شكسبير","ديكنز","تولستوي","هوميروس"]', 'شكسبير', 'أدب', 'easy'),
  ('كم لون في قوس قزح؟', '["5","6","7","8"]', '7', 'علوم', 'easy'),
  ('ما هو أسرع حيوان بري؟', '["الأسد","الفهد","الغزال","النمر"]', 'الفهد', 'علوم', 'easy'),
  ('ما هو أكبر كوكب في المجموعة الشمسية؟', '["زحل","المشتري","أورانوس","نبتون"]', 'المشتري', 'علوم', 'medium'),
  ('ما هي أصغر دولة في العالم؟', '["موناكو","سان مارينو","الفاتيكان","ليختنشتاين"]', 'الفاتيكان', 'جغرافيا', 'medium'),
  ('ما هو عنصر الذهب في الجدول الدوري؟', '["Au","Go","Gd","Gl"]', 'Au', 'علوم', 'hard'),
  ('من هو مخترع الهاتف؟', '["أديسون","غراهام بيل","نيوتن","تسلا"]', 'غراهام بيل', 'تاريخ', 'easy'),
  ('ما عدد لاعبي كرة القدم في الفريق؟', '["9","10","11","12"]', '11', 'رياضة', 'easy'),
  ('ما هو أقرب كوكب للشمس؟', '["الزهرة","عطارد","المريخ","الأرض"]', 'عطارد', 'علوم', 'medium');

-- ============================================================
-- DRAW WORDS (ارسم وخمّن)
-- ============================================================
INSERT INTO public.draw_words (word, category, difficulty) VALUES
  ('قطة', 'حيوانات', 'easy'),
  ('سيارة', 'مواصلات', 'easy'),
  ('بيت', 'أماكن', 'easy'),
  ('شمس', 'طبيعة', 'easy'),
  ('قمر', 'طبيعة', 'easy'),
  ('شجرة', 'طبيعة', 'easy'),
  ('سمكة', 'حيوانات', 'easy'),
  ('طائر', 'حيوانات', 'easy'),
  ('كلب', 'حيوانات', 'easy'),
  ('تفاحة', 'طعام', 'easy'),
  ('موزة', 'طعام', 'easy'),
  ('قلب', 'رموز', 'easy'),
  ('نظارة', 'أشياء', 'easy'),
  ('هاتف', 'تقنية', 'easy'),
  ('كتاب', 'أشياء', 'easy'),
  ('مفتاح', 'أشياء', 'easy'),
  ('طيارة', 'مواصلات', 'easy'),
  ('قطار', 'مواصلات', 'medium'),
  ('زهرة', 'طبيعة', 'easy'),
  ('كيكة', 'طعام', 'easy');

-- ============================================================
-- FORBIDDEN WORD CARDS (ممنوع تحكي)
-- ============================================================
INSERT INTO public.forbidden_cards (word, forbidden_words, category, difficulty) VALUES
  ('سيارة', '["مركبة","تقود","عجلات","بنزين","شارع"]', 'مواصلات', 'easy'),
  ('تلفاز', '["شاشة","برامج","قناة","ريموت","فلم"]', 'تقنية', 'easy'),
  ('هاتف', '["اتصال","رسالة","شاشة","بطارية","واتساب"]', 'تقنية', 'easy'),
  ('مطبخ', '["طبخ","أكل","موقد","طعام","وصفة"]', 'أماكن', 'easy'),
  ('مدرسة', '["تعليم","طالب","معلم","صف","واجب"]', 'أماكن', 'easy'),
  ('طائرة', '["سفر","طيار","مطار","تحلق","جناح"]', 'مواصلات', 'medium'),
  ('كمبيوتر', '["لابتوب","تقنية","برنامج","إنترنت","شاشة"]', 'تقنية', 'medium'),
  ('كتاب', '["قراءة","صفحة","رواية","قصة","كاتب"]', 'أشياء', 'easy'),
  ('مستشفى', '["طبيب","مرض","علاج","ممرض","دواء"]', 'أماكن', 'easy'),
  ('بحر', '["ماء","سباحة","سمك","موج","شاطئ"]', 'طبيعة', 'easy');

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
INSERT INTO public.achievements (key, name, description, icon, rarity) VALUES
  ('first_game', 'أول خبصة', 'العب لعبتك الأولى', '🎮', 'common'),
  ('win_1', 'أول فوز', 'افوز بلعبتك الأولى', '🏆', 'common'),
  ('win_10', 'بطل', 'افوز بـ 10 ألعاب', '👑', 'rare'),
  ('win_50', 'أسطورة', 'افوز بـ 50 لعبة', '⚡', 'epic'),
  ('outsider_win', 'الغريب المحترف', 'انجُ كغريب 5 مرات', '🕵️', 'rare'),
  ('drawer_master', 'فنان', 'ارسم 20 كلمة بنجاح', '🎨', 'rare'),
  ('speed_demon', 'برق', 'أجب أول سؤال في أقل من 3 ثوان', '⚡', 'rare'),
  ('social_star', 'نجم الحفلة', 'العب مع 10 أشخاص مختلفين', '🌟', 'epic'),
  ('points_1000', 'ألفي', 'اجمع 1000 نقطة', '💯', 'common'),
  ('points_10000', 'عشرة آلاف', 'اجمع 10,000 نقطة', '💎', 'legendary');
