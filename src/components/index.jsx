import { useState, useEffect } from "react"
import { T, DIM_LABELS } from "../theme"

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

// ─── Sticky Note ───
export function StickyCard({ sticky, memberMap, delay = 0 }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t) }, [delay])
  const m = memberMap[sticky.author]
  const rot = ((sticky.text.length * 7 + sticky.col * 13) % 5) - 2.5

  return (
    <div style={{
      background: sticky.color, borderRadius: 3, padding: "7px 9px", marginBottom: 5,
      color: "#1a1a1a", fontSize: 10.5, lineHeight: 1.4, position: "relative",
      transform: `rotate(${rot}deg)`, boxShadow: "1px 2px 5px rgba(0,0,0,0.12)",
      opacity: show ? 1 : 0, transition: "all 0.4s ease",
    }}>
      <div style={{ fontWeight: 700, fontSize: 9, marginBottom: 2, opacity: 0.6 }}>{m?.name}</div>
      <div>{sticky.text}</div>
      {sticky.votes?.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 5, flexWrap: "wrap" }}>
          {sticky.votes.map((v, i) => {
            const vm = memberMap[v]
            return vm ? (
              <div key={i} style={{
                width: 15, height: 15, borderRadius: "50%", background: vm.color, opacity: 0.8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 6.5, fontWeight: 700, color: "#fff",
              }}>{vm.init}</div>
            ) : null
          })}
          <span style={{ fontSize: 8, fontWeight: 700, opacity: 0.45, marginLeft: 2 }}>
            {sticky.votes.length} votos
          </span>
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
