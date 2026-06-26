import { useState } from "react"
import { T } from "../theme"
import { TEAM as SETLIST_TEAM, STAKEHOLDERS } from "../data/setlistSprint1"
import "./TeamPanel.css"

/**
 * Componente unificado para mostrar al equipo Setlist
 *
 * Props:
 *   - title: título opcional (default: "Equipo Setlist")
 *   - showStakeholder: incluir stakeholders (Mateo CEO + Paula EM) - default: true
 *   - compact: versión más pequeña para usar dentro de un challenge - default: false
 *   - strip: fila horizontal compacta (avatares) para la landing - default: false
 */
export default function TeamPanel({
  title = "Equipo Setlist",
  showStakeholder = true,
  compact = false,
  strip = false,
}) {
  const [selectedMember, setSelectedMember] = useState(null)
  const stakeholders = showStakeholder ? STAKEHOLDERS : []

  // Modal con la bio (compartido entre layouts)
  const modal = selectedMember && (
    <div className="team-member-modal-overlay" onClick={() => setSelectedMember(null)}>
      <div className="team-member-modal" onClick={(e) => e.stopPropagation()}>
        <button className="team-member-modal-close" onClick={() => setSelectedMember(null)}>×</button>
        <div className="team-member-modal-avatar" style={{ background: selectedMember.color }}>
          {selectedMember.init}
        </div>
        <h2 className="team-member-modal-name">{selectedMember.name}</h2>
        <div className="team-member-modal-role">{selectedMember.role}</div>
        <div className="team-member-modal-tagline">"{selectedMember.tagline}"</div>
        <div className="team-member-modal-bio">{selectedMember.bio}</div>
      </div>
    </div>
  )

  // ─── Variante STRIP: una fila de avatares, equipo | stakeholders ───
  if (strip) {
    // Orden pedido: PO → Tech Lead → Devs → QA
    const TEAM_ORDER = ["gabriela", "eric", "david", "alan", "nacho", "gian"]
    const orderedTeam = TEAM_ORDER.map((id) => SETLIST_TEAM.find((m) => m.id === id)).filter(Boolean)

    const AvatarBtn = (m, isStake) => (
      <button
        key={m.id}
        onClick={() => setSelectedMember(m)}
        title={`${m.name} · ${m.role}`}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", padding: 0, width: 86 }}
      >
        <span style={{ width: 46, height: 46, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, boxShadow: T.shadowCard, border: isStake ? "2px dashed rgba(139,92,246,0.6)" : "2px solid #ffffff", transition: "transform .15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >{m.init}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.navy, lineHeight: 1.1, textAlign: "center" }}>{m.name.split(" ")[0]}</span>
        <span style={{ fontSize: 9.5, fontWeight: 600, color: T.dim, lineHeight: 1.2, textAlign: "center" }}>{m.role}</span>
      </button>
    )
    return (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 22, background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "18px 22px", boxShadow: T.shadowCard }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: T.dim, textTransform: "uppercase" }}>Equipo</span>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>{orderedTeam.map((m) => AvatarBtn(m, false))}</div>
        </div>
        {stakeholders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 22, borderLeft: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: "#8b5cf6", textTransform: "uppercase" }}>Stakeholders</span>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>{stakeholders.map((m) => AvatarBtn(m, true))}</div>
          </div>
        )}
        {modal}
      </div>
    )
  }

  // ─── Variante tarjetas (default) ───
  const members = [...SETLIST_TEAM, ...stakeholders]
  return (
    <div className={`team-panel ${compact ? "team-panel-compact" : ""}`}>
      <div className="team-panel-header">
        <div className="team-panel-title">{title}</div>
        <div className="team-panel-count">{members.length} personas</div>
      </div>

      <div className="team-panel-grid">
        {members.map((member) => (
          <button
            key={member.id}
            className="team-member-card"
            onClick={() => setSelectedMember(member)}
            title={member.tagline}
          >
            <div className="team-member-avatar" style={{ background: member.color }}>
              {member.init}
            </div>
            <div className="team-member-name">{member.name}</div>
            <div className="team-member-role">{member.role}</div>
          </button>
        ))}
      </div>

      {modal}
    </div>
  )
}
