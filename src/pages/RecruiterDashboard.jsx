import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "./RecruiterDashboard.css"

export default function RecruiterDashboard() {
  const nav = useNavigate()
  const [selectedCandidates, setSelectedCandidates] = useState([])

  // Mock candidates data
  const candidates = [
    {
      id: "demo",
      name: "María González",
      email: "maria.g@email.com",
      score: 86,
      grade: "A",
      color: "#059669",
      completed: 4,
      total: 4,
      date: "2026-03-20",
      dimensions: { facilitation: 89, process: 85, coaching: 84, systems: 87 },
      redFlags: 0,
      highlights: 6,
    },
    {
      id: "candidate2",
      name: "Carlos Ramírez",
      email: "carlos.r@email.com",
      score: 78,
      grade: "B",
      color: "#2563eb",
      completed: 4,
      total: 4,
      date: "2026-03-19",
      dimensions: { facilitation: 82, process: 76, coaching: 75, systems: 79 },
      redFlags: 1,
      highlights: 4,
    },
    {
      id: "candidate3",
      name: "Ana Torres",
      email: "ana.t@email.com",
      score: 92,
      grade: "A",
      color: "#059669",
      completed: 4,
      total: 4,
      date: "2026-03-21",
      dimensions: { facilitation: 94, process: 91, coaching: 90, systems: 93 },
      redFlags: 0,
      highlights: 8,
    },
    {
      id: "candidate4",
      name: "Jorge Sánchez",
      email: "jorge.s@email.com",
      score: 65,
      grade: "C",
      color: "#ea580c",
      completed: 3,
      total: 4,
      date: "2026-03-18",
      dimensions: { facilitation: 68, process: 64, coaching: 62, systems: 66 },
      redFlags: 2,
      highlights: 2,
    },
  ]

  const toggleCandidate = (id) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const selectedCandidatesData = candidates.filter(c => selectedCandidates.includes(c.id))

  return (
    <div className="recruiter-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <button onClick={() => nav("/")} className="back-btn-dash">
            ← Volver
          </button>
          <div>
            <h1 className="dashboard-title">Dashboard de Candidatos</h1>
            <p className="dashboard-subtitle">Compará y evaluá candidatos con data objetiva</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-action">
            📊 Exportar Datos
          </button>
          <button className="btn-action primary">
            ✉️ Invitar Candidatos
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{candidates.length}</div>
          <div className="stat-label">Candidatos Evaluados</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{candidates.filter(c => c.completed === c.total).length}</div>
          <div className="stat-label">Assessments Completos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Math.round(candidates.reduce((a, b) => a + b.score, 0) / candidates.length)}%</div>
          <div className="stat-label">Score Promedio</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{candidates.filter(c => c.grade === "A").length}</div>
          <div className="stat-label">Candidatos Grado A</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="candidates-table-section">
          <div className="section-header-dash">
            <h2 className="section-title-dash">Todos los Candidatos</h2>
            <div className="table-actions">
              <input type="text" className="search-input" placeholder="Buscar candidatos..." />
              <select className="filter-select">
                <option>Todos los grades</option>
                <option>Grado A</option>
                <option>Grado B</option>
                <option>Grado C</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Candidato</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Progreso</th>
                  <th>Red Flags</th>
                  <th>Highlights</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? "selected" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleCandidate(candidate.id)}
                      />
                    </td>
                    <td>
                      <div className="candidate-cell">
                        <div className="candidate-avatar-table">{candidate.name.charAt(0)}</div>
                        <div>
                          <div className="candidate-name-table">{candidate.name}</div>
                          <div className="candidate-email-table">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="score-cell" style={{ color: candidate.color }}>
                        {candidate.score}%
                      </div>
                    </td>
                    <td>
                      <span className="grade-badge-table" style={{ color: candidate.color, borderColor: candidate.color }}>
                        {candidate.grade}
                      </span>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <span className="progress-text">{candidate.completed}/{candidate.total}</span>
                        <div className="progress-bar-mini">
                          <div className="progress-fill-mini" style={{ width: `${(candidate.completed / candidate.total) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`flag-count ${candidate.redFlags > 0 ? 'has-flags' : ''}`}>
                        {candidate.redFlags > 0 ? `⚠️ ${candidate.redFlags}` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="highlight-count">
                        {candidate.highlights > 0 ? `⭐ ${candidate.highlights}` : '—'}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(candidate.date).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-view-report-table" onClick={() => nav(`/report/${candidate.id}`)}>
                        Ver Reporte
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedCandidates.length >= 2 && (
          <div className="comparison-section">
            <h2 className="section-title-dash">Comparación de Candidatos</h2>
            <div className="comparison-grid">
              {selectedCandidatesData.map(candidate => (
                <div key={candidate.id} className="comparison-card">
                  <div className="comparison-header">
                    <div className="candidate-avatar-compare">{candidate.name.charAt(0)}</div>
                    <div>
                      <h3 className="candidate-name-compare">{candidate.name}</h3>
                      <p className="candidate-email-compare">{candidate.email}</p>
                    </div>
                  </div>

                  <div className="comparison-grade">
                    <div className="grade-display" style={{ color: candidate.color, borderColor: candidate.color }}>
                      <div className="grade-letter-compare">{candidate.grade}</div>
                      <div className="grade-score-compare">{candidate.score}%</div>
                    </div>
                  </div>

                  <div className="dimensions-compare">
                    {Object.entries(candidate.dimensions).map(([dim, score]) => (
                      <div key={dim} className="dimension-row-compare">
                        <span className="dimension-name">{dim}</span>
                        <div className="dimension-bar-compare">
                          <div className="dimension-fill-compare" style={{ width: `${score}%`, background: candidate.color }} />
                        </div>
                        <span className="dimension-value">{score}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="comparison-footer">
                    <div className="footer-stat">
                      <span className="footer-label">Red Flags:</span>
                      <span className="footer-value">{candidate.redFlags}</span>
                    </div>
                    <div className="footer-stat">
                      <span className="footer-label">Highlights:</span>
                      <span className="footer-value">{candidate.highlights}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
