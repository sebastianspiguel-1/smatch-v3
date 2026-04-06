import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "./RecruiterDashboard.css"

export default function RecruiterDashboard() {
  const nav = useNavigate()
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [gradeFilter, setGradeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New column, default to descending
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  // Helper function to calculate seniority
  const calculateSeniority = (score, redFlags) => {
    if (score >= 85 && redFlags === 0) {
      return { level: "Lead", color: "#7c3aed" }
    } else if (score >= 75 && redFlags <= 1) {
      return { level: "Senior", color: "#059669" }
    } else if (score >= 60 && score < 75) {
      return { level: "Semi-Senior", color: "#2563eb" }
    } else {
      return { level: "Junior", color: "#f59e0b" }
    }
  }

  // Helper function to calculate candidate status
  const calculateStatus = (completed, total) => {
    const percentage = (completed / total) * 100
    if (percentage === 100) {
      return { label: "Completado", icon: "●", color: "#059669", bg: "rgba(5, 150, 105, 0.08)" }
    } else if (percentage >= 50) {
      return { label: "En Progreso", icon: "◐", color: "#2563eb", bg: "rgba(37, 99, 235, 0.08)" }
    } else if (percentage > 0) {
      return { label: "Iniciado", icon: "◔", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" }
    } else {
      return { label: "Sin Empezar", icon: "○", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.08)" }
    }
  }

  // Mock candidates data - expanded dataset
  const allCandidates = [
    {
      id: "demo",
      name: "María González",
      email: "maria.g@email.com",
      score: 86,
      grade: "A",
      color: "#059669",
      completed: 6,
      total: 6,
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
      completed: 6,
      total: 6,
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
      completed: 6,
      total: 6,
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
      completed: 5,
      total: 6,
      date: "2026-03-18",
      dimensions: { facilitation: 68, process: 64, coaching: 62, systems: 66 },
      redFlags: 2,
      highlights: 2,
    },
    {
      id: "candidate5",
      name: "Laura Martínez",
      email: "laura.m@email.com",
      score: 81,
      grade: "B",
      color: "#2563eb",
      completed: 6,
      total: 6,
      date: "2026-03-22",
      dimensions: { facilitation: 85, process: 80, coaching: 78, systems: 82 },
      redFlags: 0,
      highlights: 5,
    },
    {
      id: "candidate6",
      name: "Diego Fernández",
      email: "diego.f@email.com",
      score: 88,
      grade: "A",
      color: "#059669",
      completed: 6,
      total: 6,
      date: "2026-03-23",
      dimensions: { facilitation: 90, process: 87, coaching: 86, systems: 89 },
      redFlags: 0,
      highlights: 7,
    },
    {
      id: "candidate7",
      name: "Patricia Ruiz",
      email: "patricia.r@email.com",
      score: 72,
      grade: "B",
      color: "#2563eb",
      completed: 6,
      total: 6,
      date: "2026-03-17",
      dimensions: { facilitation: 76, process: 71, coaching: 70, systems: 73 },
      redFlags: 1,
      highlights: 3,
    },
    {
      id: "candidate8",
      name: "Roberto Silva",
      email: "roberto.s@email.com",
      score: 58,
      grade: "C",
      color: "#ea580c",
      completed: 4,
      total: 6,
      date: "2026-03-16",
      dimensions: { facilitation: 62, process: 58, coaching: 55, systems: 60 },
      redFlags: 3,
      highlights: 1,
    },
  ]

  // Filter, search, and sort logic
  const candidates = allCandidates
    .filter(c => {
      // Grade filter
      if (gradeFilter !== "all" && c.grade !== gradeFilter) return false
      // Search filter
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !c.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "score") {
        comparison = a.score - b.score
      } else if (sortBy === "seniority") {
        const seniorityOrder = { "Lead": 4, "Senior": 3, "Semi-Senior": 2, "Junior": 1 }
        const aSeniority = calculateSeniority(a.score, a.redFlags)
        const bSeniority = calculateSeniority(b.score, b.redFlags)
        comparison = seniorityOrder[aSeniority.level] - seniorityOrder[bSeniority.level]
      } else if (sortBy === "progress") {
        const aProgress = a.completed / a.total
        const bProgress = b.completed / b.total
        comparison = aProgress - bProgress
      } else if (sortBy === "redFlags") {
        comparison = a.redFlags - b.redFlags
      } else if (sortBy === "highlights") {
        comparison = a.highlights - b.highlights
      } else if (sortBy === "date") {
        comparison = new Date(a.date) - new Date(b.date)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

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
          <div className="stat-number">{allCandidates.length}</div>
          <div className="stat-label">Candidatos Evaluados</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{allCandidates.filter(c => c.completed === c.total).length}</div>
          <div className="stat-label">Assessments Completos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Math.round(allCandidates.reduce((a, b) => a + b.score, 0) / allCandidates.length)}%</div>
          <div className="stat-label">Score Promedio</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{allCandidates.filter(c => c.grade === "A").length}</div>
          <div className="stat-label">Candidatos Grado A</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="candidates-table-section">
          <div className="section-header-dash">
            <h2 className="section-title-dash">Todos los Candidatos ({candidates.length})</h2>
            <div className="table-actions">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar candidatos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="filter-select"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
              >
                <option value="all">Todos los grades</option>
                <option value="A">Grado A</option>
                <option value="B">Grado B</option>
                <option value="C">Grado C</option>
              </select>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Ordenar por: Fecha</option>
                <option value="score">Ordenar por: Score</option>
                <option value="name">Ordenar por: Nombre</option>
                <option value="grade">Ordenar por: Grade</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort("name")}>
                    Nombre y Apellido
                    {sortBy === "name" && <span className="sort-arrow">{sortDirection === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                  <th className="sortable" onClick={() => handleSort("progress")}>
                    Estado
                    {sortBy === "progress" && <span className="sort-arrow">{sortDirection === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                  <th className="sortable" onClick={() => handleSort("score")}>
                    Score
                    {sortBy === "score" && <span className="sort-arrow">{sortDirection === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                  <th className="sortable" onClick={() => handleSort("seniority")}>
                    Seniority
                    {sortBy === "seniority" && <span className="sort-arrow">{sortDirection === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                  <th className="sortable" onClick={() => handleSort("redFlags")}>
                    Red Flags
                    {sortBy === "redFlags" && <span className="sort-arrow">{sortDirection === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                  <th className="sortable" onClick={() => handleSort("highlights")}>
                    Highlights
                    {sortBy === "highlights" && <span className="sort-arrow">{sortDirection === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                  <th className="sortable" onClick={() => handleSort("date")}>
                    Fecha
                    {sortBy === "date" && <span className="sort-arrow">{sortDirection === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => {
                  const seniority = calculateSeniority(candidate.score, candidate.redFlags)
                  const status = calculateStatus(candidate.completed, candidate.total)
                  return (
                    <tr key={candidate.id}>
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
                        <div className="status-badge-cell" style={{ color: status.color, background: status.bg }}>
                          <span className="status-icon">{status.icon}</span>
                          <span className="status-label">{status.label}</span>
                        </div>
                      </td>
                      <td>
                        <div className="score-cell" style={{ color: candidate.color }}>
                          {candidate.score}%
                        </div>
                      </td>
                      <td>
                        <span className="seniority-badge-table" style={{ color: seniority.color, borderColor: seniority.color }}>
                          {seniority.level}
                        </span>
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
                  )
                })}
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
