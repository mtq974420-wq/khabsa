# خَبْصَة | KHABSA 🎮

> اللعب بلّش... والخبصة علينا!

**KHABSA** is a premium Arabic multiplayer party gaming platform. Play 7 unique social games with friends in private or public rooms, complete with voice chat, real-time synchronization, and a beautiful Arabic-first interface.

---

## 🎮 Games

| Game | Arabic Name | Players | Description |
|------|------------|---------|-------------|
| Who's the Outsider? | مين برا السالفة؟ | 3-10 | Find who doesn't know the secret word |
| Who Missed the Beat? | مين الأطرش بالزفة؟ | 3-8 | Find who got a different question |
| Who Has the Different Picture? | مين برا الرسمة؟ | 3-8 | Find who sees a different image |
| Most Likely To? | مين غالباً؟ | 3-12 | Vote on who best matches funny prompts |
| Forbidden Words! | ممنوع تحكي! | 4-12 | Team game: explain without forbidden words |
| Speed Challenge | تحدي السرعة | 2-10 | Fast-paced trivia quiz |
| Draw & Guess | ارسم وخمّن | 3-8 | Draw words while others guess |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/khabsa.git
cd khabsa

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The app will run at `http://localhost:5173`

> **Demo Mode**: The app works fully without Supabase in single-browser demo mode. For real multiplayer across devices, configure Supabase below.

---

## ⚙️ Configuration

### Supabase Setup (Required for Multiplayer)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the database migration:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually in Supabase SQL editor
   # Run: supabase/migrations/001_initial_schema.sql
   ```
3. Load seed data:
   ```bash
   # Run: supabase/seed/seed.sql in Supabase SQL editor
   ```
4. Enable Realtime for tables: `rooms`, `room_players`, `chat_messages`, `game_sessions`
5. Update `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Voice Chat (WebRTC)

Voice chat uses WebRTC with Google STUN servers by default. For production:

1. Deploy a TURN server (recommended: [coturn](https://github.com/coturn/coturn)):
   ```bash
   # Docker
   docker run -d --network=host \
     -e DETECT_EXTERNAL_IP=yes \
     -e TURN_USERNAME=user \
     -e TURN_PASSWORD=pass \
     instrumentisto/coturn
   ```
2. Update `.env`:
   ```env
   VITE_TURN_SERVER=turn:your-server.com:3478
   VITE_TURN_USERNAME=user
   VITE_TURN_CREDENTIAL=pass
   ```

---

## 🏗️ Architecture

```
khabsa/
├── src/
│   ├── components/
│   │   ├── ui/          # Design system: Button, Avatar, Timer, Badge, Modal
│   │   ├── layout/      # Navbar
│   │   ├── room/        # GameSelector
│   │   ├── chat/        # ChatPanel
│   │   └── voice/       # VoiceChat (WebRTC)
│   ├── games/
│   │   ├── GameContainer.tsx      # Game router
│   │   ├── meen-barra/            # مين برا السالفة؟
│   │   ├── meen-atrash/           # مين الأطرش بالزفة؟
│   │   ├── meen-barra-rasma/      # مين برا الرسمة؟
│   │   ├── meen-ghalban/          # مين غالباً؟
│   │   ├── mamnoo3/               # ممنوع تحكي!
│   │   ├── tahadi/                # تحدي السرعة
│   │   └── irsom/                 # ارسم وخمّن
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── AuthPage.tsx           # Login/Register
│   │   ├── GamesPage.tsx          # Games library
│   │   ├── CreateRoomPage.tsx     # Room creation
│   │   ├── RoomPage.tsx           # Room lobby + game
│   │   ├── LeaderboardPage.tsx    # Leaderboard
│   │   ├── ProfilePage.tsx        # User profile
│   │   └── AdminPage.tsx          # Admin dashboard
│   ├── stores/
│   │   ├── authStore.ts           # Auth state (Zustand)
│   │   └── roomStore.ts           # Room state (Zustand)
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── constants.ts           # Game configs
│   │   └── utils.ts               # Helpers
│   └── types/index.ts             # TypeScript types
├── supabase/
│   ├── migrations/                # DB schema
│   └── seed/                      # Sample data
└── public/
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion
- **State**: Zustand (with persistence)
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Voice**: WebRTC (native browser API)
- **Icons**: Lucide React

---

## 🎯 Features

### Multiplayer
- ✅ Unique 6-character room codes
- ✅ Private rooms (invite-only)
- ✅ Public rooms (open discovery)
- ✅ Up to 12 players per room
- ✅ Host migration
- ✅ Reconnection support
- ✅ Real-time player sync via Supabase Realtime
- ✅ Player ready system
- ✅ Spectator support

### Voice Chat
- ✅ Browser-native WebRTC
- ✅ Mute/unmute
- ✅ Volume control
- ✅ Speaking detection
- ✅ Graceful degradation (no mic? still play)
- ✅ STUN server support
- ✅ Permission error handling

### Games
- ✅ Server-authoritative secret roles
- ✅ Real scoring with time bonuses
- ✅ Multiple rounds
- ✅ Timer countdowns
- ✅ Voting system
- ✅ Result screens
- ✅ Shared drawing canvas (ارسم وخمّن)

### Arabic Support
- ✅ Full RTL layout
- ✅ Cairo + Tajawal Arabic fonts
- ✅ Jordanian Arabic UI copy
- ✅ Arabic game content
- ✅ Mobile responsive

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
# Or connect GitHub repo for auto-deploy
```

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### nginx.conf
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    gzip on;
    gzip_types text/plain application/javascript text/css;
}
```

---

## 🔐 Security

- **Row Level Security** enabled on all Supabase tables
- **Anon key** only exposed to frontend (never service role key)
- **Server-authoritative** game logic for secret roles/words
- **Input sanitization** on all user inputs
- **Rate limiting** via Supabase

---

## 👨‍💻 Admin Dashboard

Access at `/admin` with an account that has `role: 'admin'`.

Features:
- Dashboard with live stats
- Manage secret words, questions, draw words
- Manage forbidden word cards
- User management
- Platform settings

---

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for Arabic gaming communities. | صُنع بحب لمجتمعات الألعاب العربية
