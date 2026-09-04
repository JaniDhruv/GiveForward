# 🌱 GiveForward

> **Generosity isn't measured in dollars — it's measured in chains of human connection.**

GiveForward is a generosity chain platform that connects people who need help with people ready to give it. Every completed act creates a visible chain of kindness that ripples forward through the community.

**Built for the [DEV Weekend Challenge: Generosity Edition](https://dev.to/challenges/weekend-2026-09-03), inspired by the International Day of Charity (September 5).**

---

## ✨ The Core Idea

Most charity platforms track individual donations. **GiveForward tracks chains.**

When you help someone, that person is inspired to help someone else. One act of kindness creates a visible, growing chain of generosity — and our interactive D3.js visualization makes those ripples tangible.

**Need/Offer → AI understands it → AI finds a match → act completed → chain grows → visualization shows the ripple.**

---

## 🔗 How It Works

1. **Share what you need or can give** — Speak naturally or type. Our AI understands both.
2. **AI finds your match** — Google Gemini analyzes context, not just keywords.
3. **Complete the act** — Connect, help, and mark it done.
4. **Watch the chain grow** — The person you helped helps someone else. Your generosity ripples forward.

---

## ⚡ Tech Stack

| Technology | Usage |
|---|---|
| **Google Gemini AI** (2.0 Flash) | Natural language parsing & intelligent match ranking |
| **ElevenLabs** (Flash v2.5) | Voice-based confirmations & accessibility |
| **D3.js** (d3-force) | Interactive force-directed generosity chain visualization |
| **Web Speech API** | Voice input for hands-free request creation |
| **Vanilla JS + Vite** | Zero-framework SPA with hash-based routing |
| **Vercel** | Serverless API routes + hosting |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google AI API key (for Gemini)
- An ElevenLabs API key (for TTS)

### Setup

```bash
# Clone the repo
git clone https://github.com/JaniDhruv/GiveForward.git
cd GiveForward

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your API keys

# Run locally
npm run dev
```

### Environment Variables

```
GOOGLE_AI_API_KEY=your_google_ai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

---

## 📁 Project Structure

```
GiveForward/
├── api/                    # Serverless API routes (Vercel)
│   ├── parse.js            # Gemini — parse natural language input
│   ├── match.js            # Gemini — rank matches
│   └── speak.js            # ElevenLabs — text-to-speech
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── navbar.js       # Glassmorphism navigation bar
│   │   ├── network-graph.js # D3 force-directed graph visualization
│   │   ├── particles.js    # Canvas particle background
│   │   ├── card.js         # Need/offer entry cards
│   │   ├── voice-input.js  # Web Speech API voice input
│   │   ├── ai-parser.js    # AI parse result display
│   │   ├── stats-counter.js # Animated stat counters
│   │   └── toast.js        # Notification toasts
│   ├── pages/              # SPA page routes
│   │   ├── home.js         # Landing page with network graph
│   │   ├── explore.js      # Browse needs & offers
│   │   ├── create.js       # Post need/offer with AI + voice
│   │   ├── impact.js       # Personal chain dashboard
│   │   └── about.js        # Mission & tech credits
│   ├── styles/             # CSS design system
│   │   ├── variables.css   # Design tokens & theme
│   │   ├── base.css        # Reset & typography
│   │   ├── animations.css  # Keyframes & utilities
│   │   ├── components.css  # Component styles
│   │   ├── layout.css      # Layout & responsive
│   │   └── pages/          # Page-specific styles
│   ├── data/
│   │   └── seed.js         # 30 seed entries + 5 demo chains
│   ├── store.js            # State management (localStorage + pub/sub)
│   ├── router.js           # Hash-based SPA router
│   └── main.js             # App entry point
├── index.html              # HTML shell
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel deployment config
└── package.json
```

---

## 🌊 Key Features

- **🔗 Generosity Chains** — Visual chains of kindness that grow with each act
- **🤖 AI-Powered Matching** — Google Gemini understands natural language needs/offers
- **🎙️ Voice Input** — Speak your request hands-free
- **🔊 Voice Confirmations** — ElevenLabs reads back your confirmation
- **📊 Interactive Network Graph** — D3 force-directed visualization
- **📈 Personal Impact Dashboard** — See how your generosity ripples
- **🌙 Dark Mode** — Beautiful glassmorphism design
- **📱 Responsive** — Works on all screen sizes

---

## 👤 Creator

**Dhruv Jani** — Built with ❤️ for the DEV Weekend Challenge: Generosity Edition

---

## 📄 License

MIT
