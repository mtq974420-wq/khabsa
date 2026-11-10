# 🗄️ Database Setup — One Paste, Done!

## Go to your SQL Editor:
👉 https://supabase.com/dashboard/project/gbscopifduazmygfdkbh/sql/new

## Paste this ENTIRE block and click "Run":

```sql
-- ============================================================
-- KHABSA Complete Database Setup
-- Run this once in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  avatar_color TEXT NOT NULL DEFAULT '#7c3aed',
  avatar_emoji TEXT NOT NULL DEFAULT '🎮',
  role TEXT NOT NULL DEFAULT 'user',
  is_guest BOOLEAN NOT NULL DEFAULT false,
  total_games INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  friends UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby',
  game_type TEXT,
  max_players INTEGER NOT NULL DEFAULT 8,
  is_private BOOLEAN NOT NULL DEFAULT true,
  password TEXT,
  current_game_id UUID,
  settings JSONB NOT NULL DEFAULT '{"rounds":5,"round_duration":60,"voting_duration":30,"allow_spectators":true,"auto_start":false}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROOM PLAYERS
CREATE TABLE IF NOT EXISTS public.room_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#7c3aed',
  avatar_emoji TEXT NOT NULL DEFAULT '🎮',
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  is_spectator BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'connected',
  score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#7c3aed',
  avatar_emoji TEXT NOT NULL DEFAULT '🎮',
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GAME SESSIONS
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 5,
  round_start_time TIMESTAMPTZ,
  round_end_time TIMESTAMPTZ,
  game_data JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECRET WORDS
CREATE TABLE IF NOT EXISTS public.secret_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRIVIA QUESTIONS
CREATE TABLE IF NOT EXISTS public.trivia_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DRAW WORDS
CREATE TABLE IF NOT EXISTS public.draw_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FORBIDDEN CARDS
CREATE TABLE IF NOT EXISTS public.forbidden_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  forbidden_words JSONB NOT NULL DEFAULT '[]',
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON public.room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id);

-- DISABLE RLS for simplicity (enable later with proper auth)
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_words DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_words DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forbidden_cards DISABLE ROW LEVEL SECURITY;

-- SEED: Secret Words
INSERT INTO public.secret_words (word, category, difficulty) VALUES
  ('بيتزا','طعام','easy'),('كنافة','طعام','easy'),('منسف','طعام','medium'),
  ('فلافل','طعام','easy'),('شاورما','طعام','easy'),('قهوة','مشروبات','easy'),
  ('كرة قدم','رياضة','easy'),('سباحة','رياضة','easy'),('مطار','أماكن','easy'),
  ('شاطئ','أماكن','easy'),('مستشفى','أماكن','easy'),('مدرسة','أماكن','easy'),
  ('أسد','حيوانات','easy'),('فيل','حيوانات','easy'),('دلفين','حيوانات','medium'),
  ('طبيب','مهن','easy'),('معلم','مهن','easy'),('مهندس','مهن','easy'),
  ('هاتف','تقنية','easy'),('سيارة','مواصلات','easy'),('طيارة','مواصلات','easy'),
  ('سينما','ترفيه','easy'),('موسيقى','ترفيه','easy'),('كتاب','ترفيه','easy'),
  ('جبل','طبيعة','easy'),('بحر','طبيعة','easy'),('صحراء','طبيعة','medium'),
  ('مطعم','أماكن','easy'),('جامعة','أماكن','easy'),('ملعب','أماكن','easy')
ON CONFLICT DO NOTHING;

-- SEED: Trivia Questions
INSERT INTO public.trivia_questions (question, options, correct_answer, category, difficulty) VALUES
  ('ما هي عاصمة المملكة العربية السعودية؟','["الرياض","جدة","مكة","المدينة"]','الرياض','جغرافيا','easy'),
  ('كم عدد أيام الأسبوع؟','["5","6","7","8"]','7','عام','easy'),
  ('ما هو أكبر محيط في العالم؟','["الأطلسي","الهادئ","الهندي","المتجمد"]','الهادئ','جغرافيا','medium'),
  ('من كتب روميو وجولييت؟','["شكسبير","ديكنز","تولستوي","هوميروس"]','شكسبير','أدب','easy'),
  ('كم لون في قوس قزح؟','["5","6","7","8"]','7','علوم','easy'),
  ('ما هو أسرع حيوان بري؟','["الأسد","الفهد","الغزال","النمر"]','الفهد','علوم','easy'),
  ('ما هو أكبر كوكب في المجموعة الشمسية؟','["زحل","المشتري","أورانوس","نبتون"]','المشتري','علوم','medium'),
  ('ما هي أصغر دولة في العالم؟','["موناكو","سان مارينو","الفاتيكان","ليختنشتاين"]','الفاتيكان','جغرافيا','medium'),
  ('من هو مخترع الهاتف؟','["أديسون","غراهام بيل","نيوتن","تسلا"]','غراهام بيل','تاريخ','easy'),
  ('ما عدد لاعبي كرة القدم في الفريق؟','["9","10","11","12"]','11','رياضة','easy'),
  ('ما هو أقرب كوكب للشمس؟','["الزهرة","عطارد","المريخ","الأرض"]','عطارد','علوم','medium'),
  ('ما عاصمة فرنسا؟','["برلين","مدريد","باريس","روما"]','باريس','جغرافيا','easy'),
  ('كم ضلع في المثلث؟','["2","3","4","5"]','3','رياضيات','easy'),
  ('ما هو أطول نهر في العالم؟','["الأمازون","النيل","المسيسيبي","الغانج"]','النيل','جغرافيا','easy'),
  ('ما عنصر الذهب في الجدول الدوري؟','["Au","Go","Gd","Gl"]','Au','علوم','hard')
ON CONFLICT DO NOTHING;

-- SEED: Draw Words
INSERT INTO public.draw_words (word, category, difficulty) VALUES
  ('قطة','حيوانات','easy'),('سيارة','مواصلات','easy'),('بيت','أماكن','easy'),
  ('شمس','طبيعة','easy'),('قمر','طبيعة','easy'),('شجرة','طبيعة','easy'),
  ('سمكة','حيوانات','easy'),('طائر','حيوانات','easy'),('كلب','حيوانات','easy'),
  ('تفاحة','طعام','easy'),('موزة','طعام','easy'),('قلب','رموز','easy'),
  ('نظارة','أشياء','easy'),('هاتف','تقنية','easy'),('كتاب','أشياء','easy'),
  ('مفتاح','أشياء','easy'),('طيارة','مواصلات','easy'),('قطار','مواصلات','medium'),
  ('زهرة','طبيعة','easy'),('كيكة','طعام','easy'),('نجمة','رموز','easy'),
  ('بيضة','طعام','easy'),('كوب','أشياء','easy'),('قلم','أشياء','easy'),
  ('ساعة','أشياء','medium'),('برتقالة','طعام','easy'),('حصان','حيوانات','easy'),
  ('أرنب','حيوانات','easy'),('بالونة','أشياء','easy'),('قوس قزح','طبيعة','medium')
ON CONFLICT DO NOTHING;

-- SEED: Forbidden Cards
INSERT INTO public.forbidden_cards (word, forbidden_words, category) VALUES
  ('سيارة','["مركبة","تقود","عجلات","بنزين","شارع"]','مواصلات'),
  ('تلفاز','["شاشة","برامج","قناة","ريموت","فلم"]','تقنية'),
  ('هاتف','["اتصال","رسالة","شاشة","بطارية","واتساب"]','تقنية'),
  ('مطبخ','["طبخ","أكل","موقد","طعام","وصفة"]','أماكن'),
  ('مدرسة','["تعليم","طالب","معلم","صف","واجب"]','أماكن'),
  ('طائرة','["سفر","طيار","مطار","تحلق","جناح"]','مواصلات'),
  ('كمبيوتر','["لابتوب","تقنية","برنامج","إنترنت","شاشة"]','تقنية'),
  ('كتاب','["قراءة","صفحة","رواية","قصة","كاتب"]','أشياء'),
  ('مستشفى','["طبيب","مرض","علاج","ممرض","دواء"]','أماكن'),
  ('بحر','["ماء","سباحة","سمك","موج","شاطئ"]','طبيعة'),
  ('سوبرماركت','["تسوق","بقالة","عربة","خضار","كاشير"]','أماكن'),
  ('عيد ميلاد','["كيكة","شمعة","هدية","احتفال","سنة"]','مناسبات'),
  ('نوم','["سرير","تعب","حلم","ليل","فراش"]','روتين'),
  ('موسيقى','["أغنية","إيقاع","آلة","صوت","وتر"]','ترفيه'),
  ('رياضة','["تمرين","لياقة","ملعب","فريق","فوز"]','نشاط')
ON CONFLICT DO NOTHING;

SELECT 'Setup complete! Tables created and seeded.' as result;
```

## Then enable Realtime:
👉 https://supabase.com/dashboard/project/gbscopifduazmygfdkbh/database/replication

Enable these tables: **rooms**, **room_players**, **chat_messages**, **game_sessions**
