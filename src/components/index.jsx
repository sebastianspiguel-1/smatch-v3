import { useState, useEffect } from "react"
import { T, DIM_LABELS } from "../theme"

// Re-export new components
export { default as RadarChartComponent } from "./RadarChartComponent"
export { default as FeedbackModal } from "./FeedbackModal"
export { default as ProgressBar } from "./ProgressBar"
export { default as TopBar } from "./TopBar"
export { default as FeedbackToast } from "./FeedbackToast"
export { default as FeedbackTimeline } from "./FeedbackTimeline"

// ─── Avatar ───
export function Avatar({ member, size = 24 }) {
  if (!member) return null
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: member.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {member.init}
    </div>
  )
}

// ─── Sticky Note (Lexipol-style with left border) ───
export function StickyCard({ sticky, memberMap, delay = 0 }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t) }, [delay])
  const m = memberMap[sticky.author]

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?"
    return name.split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2)
  }

  // Hash-based avatar colors
  const AVATAR_COLORS = [
    { bg: "#dbeafe", text: "#1e40af" }, { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#dcfce7", text: "#166534" }, { bg: "#fef3c7", text: "#92400e" },
    { bg: "#ede9fe", text: "#5b21b6" }, { bg: "#ffedd5", text: "#9a3412" },
    { bg: "#cffafe", text: "#155e75" }, { bg: "#fef9c3", text: "#713f12" },
  ]
  const hash = (str = "") => {
    let h = 0
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i)
    return Math.abs(h)
  }
  const avatarColor = AVATAR_COLORS[hash(sticky.author || "") % AVATAR_COLORS.length]

  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${T.border}`,
      borderLeft: `4px solid ${sticky.color}`,
      borderRadius: 8,
      padding: "9px 12px",
      marginBottom: 7,
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(8px)",
      transition: "all 0.3s ease",
      transitionDelay: `${delay}ms`
    }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: avatarColor.bg,
        color: avatarColor.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
        border: "2px solid #fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.1)"
      }}>
        {getInitials(m?.name || sticky.author)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, lineHeight: 1.4 }}>
          {sticky.text}
        </div>
        <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>
          {m?.name || sticky.author}
        </div>
      </div>
      {sticky.votes?.length > 0 && (
        <div style={{
          background: "#dcfce7",
          borderRadius: 100,
          padding: "3px 8px",
          fontSize: 11,
          fontWeight: 700,
          color: "#166534",
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexShrink: 0
        }}>
          👍 {sticky.votes.length}
        </div>
      )}
    </div>
  )
}

// ─── Chat Bubble ───
export function ChatBubble({ msg, memberMap }) {
  if (msg.narration) {
    return (
      <div style={{
        fontSize: 10.5, color: T.dim, padding: "5px 8px", margin: "5px 0",
        background: T.tealDim, borderRadius: 5, borderLeft: `2px solid ${T.teal}`,
        lineHeight: 1.4, fontStyle: "italic",
      }}>{msg.text}</div>
    )
  }
  if (msg.isYou) {
    return (
      <div style={{
        margin: "5px 0", padding: "6px 8px", borderRadius: 6,
        background: `${T.teal}18`, borderLeft: `3px solid ${T.teal}`,
        fontSize: 11.5, color: T.teal, lineHeight: 1.4,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 1, opacity: 0.7 }}>TÚ (Scrum Master)</div>
        {msg.text}
      </div>
    )
  }
  const m = memberMap?.[msg.from]
  if (!m) return null
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
      <Avatar member={m} size={22} />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.name}</span>
        <div style={{ fontSize: 11.5, color: T.text, lineHeight: 1.4, marginTop: 1 }}>{msg.text}</div>
      </div>
    </div>
  )
}

// ─── Mini Board Preview (para selección de formato) ───
export function MiniBoard({ cols, active }) {
  const colors = [T.sY, T.sG, T.sP, T.sB, T.sO]
  return (
    <div style={{
      display: "flex", gap: 3, padding: 5, background: T.panel, borderRadius: 5,
      border: `1px solid ${active ? T.teal : T.border}`, transition: "border 0.2s",
    }}>
      {cols.map((c, i) => (
        <div key={i} style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 6.5, fontWeight: 700, color: active ? T.teal : T.dim,
            textAlign: "center", marginBottom: 2, whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>{c.replace(/😊|😔|😤/g, "").trim()}</div>
          {[0, 1, 2].map(j => (
            <div key={j} style={{
              height: 5, borderRadius: 1.5, marginBottom: 1.5,
              background: colors[(i * 3 + j) % colors.length],
              opacity: j === 0 ? 0.7 : j === 1 ? 0.45 : 0.25,
            }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Score Badges ───
export function ScoreBadges({ scores }) {
  if (!scores) return null
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4 }}>
      {Object.entries(scores).map(([k, v]) => {
        const c = v >= 4 ? T.green : v >= 3 ? T.blue : v >= 2 ? T.orange : T.red
        return (
          <span key={k} style={{
            fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 8,
            background: `${c}22`, color: c,
          }}>
            {DIM_LABELS[k] || k}: {v}/4
          </span>
        )
      })}
    </div>
  )
}
