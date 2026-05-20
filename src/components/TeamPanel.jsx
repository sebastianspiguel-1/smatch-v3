import { useState } from "react"
import { TEAM as SETLIST_TEAM, SETLIST_FOUNDER as SETLIST_STAKEHOLDER } from "../data/setlistSprint1"
import "./TeamPanel.css"

/**
 * Componente unificado para mostrar al equipo Setlist
 *
 * Props:
 *   - title: título opcional (default: "EQUIPO SETLIST")
 *   - showStakeholder: incluir Mateo (Founder/CEO) - default: true
 *   - compact: versión más pequeña para usar dentro de un challenge - default: false
 */
export default function TeamPanel({
  title = "Equipo Setlist",
  showStakeholder = true,
  compact = false
}) {
  const [selectedMember, setSelectedMember] = useState(null)

  const members = showStakeholder
    ? [...SETLIST_TEAM, SETLIST_STAKEHOLDER]
    : SETLIST_TEAM

  return (
    <div className={`team-panel ${compact ? "team-panel-compact" : ""}`}>
      <div className="team-panel-header">
        <div className="team-panel-title">{title}</div>
        <div className="team-panel-count">{members.length} personas</div>
      </div>

      <div className="team-panel-grid">
        {members.map(member => (
          <button
            key={member.id}
            className="team-member-card"
            onClick={() => setSelectedMember(member)}
            title={member.tagline}
          >
            <div
              className="team-member-avatar"
              style={{ background: member.color }}
            >
              {member.init}
            </div>
            <div className="team-member-name">{member.name}</div>
            <div className="team-member-role">{member.role}</div>
          </button>
        ))}
      </div>

      {/* Modal con info detallada */}
      {selectedMember && (
        <div
          className="team-member-modal-overlay"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="team-member-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="team-member-modal-close"
              onClick={() => setSelectedMember(null)}
            >
              ×
            </button>

            <div
              className="team-member-modal-avatar"
              style={{ background: selectedMember.color }}
            >
              {selectedMember.init}
            </div>

            <h2 className="team-member-modal-name">{selectedMember.name}</h2>
            <div className="team-member-modal-role">{selectedMember.role}</div>

            <div className="team-member-modal-tagline">
              "{selectedMember.tagline}"
            </div>

            <div className="team-member-modal-bio">
              {selectedMember.bio}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
