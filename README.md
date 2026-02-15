# SMatch v2

Simulaciones de Scrum Master basadas en situaciones reales.

## Estructura

```
smatch-v2/
├── api/
│   └── chat.js                 ← Proxy serverless (Vercel) para Anthropic
├── src/
│   ├── App.jsx                 ← Router principal
│   ├── main.jsx                ← Entry point
│   ├── index.css               ← Estilos globales
│   ├── theme.js                ← Colores y tokens de diseño
│   ├── pages/
│   │   └── ChallengeMenu.jsx   ← Menú de challenges
│   ├── challenges/
│   │   └── Challenge01.jsx     ← La retro que parece perfecta
│   ├── engine/
│   │   ├── ai.js               ← Llamadas a Claude + scoring
│   │   └── supabase.js         ← Cliente Supabase + queries
│   ├── components/
│   │   └── index.jsx           ← Avatar, Sticky, Chat, MiniBoard, etc.
│   └── data/
│       └── challenge01.js      ← Data del challenge 1 (equipo, stickies, momentos)
├── supabase/
│   └── migration.sql           ← SQL para crear tabla de resultados
├── .env.example
└── package.json
```

## Para agregar un challenge nuevo

1. Crear `src/data/challenge02.js` con el equipo, stickies, momentos
2. Crear `src/challenges/Challenge02.jsx` (copiar Challenge01, cambiar imports)
3. Agregar la ruta en `src/App.jsx`
4. Activar en `src/pages/ChallengeMenu.jsx` (cambiar `ready: true`)

## Setup

```bash
npm install
cp .env.example .env   # completar con tus keys
npm run dev
```

## Deploy

```bash
git init && git add . && git commit -m "SMatch v2"
# Subir a GitHub → importar en Vercel
# Agregar ANTHROPIC_API_KEY en Vercel Environment Variables
```

## Supabase

Correr `supabase/migration.sql` en el SQL Editor de Supabase para crear la tabla de resultados.
