import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RecruiterDashboard from "./RecruiterDashboard"
import "./RecruiterHub.css"

const SIDEBAR_ITEMS = [
  { id: "home", label: "Inicio", icon: "🏠" },
  { id: "candidates", label: "Candidatos & Resultados", icon: "👥" },
  { id: "assessments", label: "Assessments", icon: "📋" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "settings", label: "Configuración", icon: "⚙️" },
]

export default function RecruiterHub() {
  const nav = useNavigate()
  const [activeSection, setActiveSection] = useState("home")

  function handleLogout() {
    nav("/")
  }

  return (
    <div className="recruiter-hub">
      {/* Sidebar */}
      <aside className="hub-sidebar">
        <div className="hub-sidebar-header">
          <button className="hub-logo" onClick={() => nav("/")}>
            SMatch
          </button>
          <div className="hub-role-badge">RECRUITER</div>
        </div>

        <nav className="hub-nav">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              className={`hub-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="hub-nav-icon">{item.icon}</span>
              <span className="hub-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="hub-sidebar-footer">
          <div className="hub-user-info">
            <div className="hub-user-avatar">R</div>
            <div className="hub-user-details">
              <div className="hub-user-name">Recruiter Demo</div>
              <div className="hub-user-email">recruiter@smatch.com</div>
            </div>
          </div>
          <button className="hub-logout-btn" onClick={handleLogout}>
            ← Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="hub-content">
        {activeSection === "home" && <HomeSection setActiveSection={setActiveSection} />}
        {activeSection === "candidates" && <CandidatesSection />}
        {activeSection === "assessments" && <AssessmentsSection />}
        {activeSection === "analytics" && <AnalyticsSection />}
        {activeSection === "settings" && <SettingsSection />}
      </main>
    </div>
  )
}

// ═══════════════════════ HOME SECTION ═══════════════════════
function HomeSection({ setActiveSection }) {
  return (
    <div className="hub-section">
      <div className="hub-demo-banner">
        <span className="hub-demo-badge">DEMO</span>
        <span>Estás viendo datos de muestra. Tu dashboard real va a mostrar los candidatos que evalúes con Smatch.</span>
      </div>

      <div className="hub-section-header">
        <h1>👋 Bienvenido de vuelta</h1>
        <p>Gestioná tu pipeline de talento ágil desde un solo lugar</p>
      </div>

      {/* Quick Stats */}
      <div className="hub-stats-grid">
        <div className="hub-stat-card">
          <div className="hub-stat-icon">👥</div>
          <div className="hub-stat-value">8</div>
          <div className="hub-stat-label">Candidatos activos</div>
        </div>
        <div className="hub-stat-card">
          <div className="hub-stat-icon">✅</div>
          <div className="hub-stat-value">5</div>
          <div className="hub-stat-label">Assessments completados</div>
        </div>
        <div className="hub-stat-card">
          <div className="hub-stat-icon">⭐</div>
          <div className="hub-stat-value">82%</div>
          <div className="hub-stat-label">Score promedio</div>
        </div>
        <div className="hub-stat-card">
          <div className="hub-stat-icon">📈</div>
          <div className="hub-stat-value">3</div>
          <div className="hub-stat-label">Top performers</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hub-quick-actions">
        <h2>Acciones rápidas</h2>
        <div className="hub-actions-grid">
          <button className="hub-action-card" onClick={() => setActiveSection("candidates")}>
            <div className="hub-action-icon">👥</div>
            <h3>Ver candidatos</h3>
            <p>Revisá los resultados de los assessments completados</p>
            <span className="hub-action-arrow">→</span>
          </button>
          <button className="hub-action-card" onClick={() => setActiveSection("assessments")}>
            <div className="hub-action-icon">📋</div>
            <h3>Nuevo assessment</h3>
            <p>Creá una nueva posición para evaluar candidatos</p>
            <span className="hub-action-arrow">→</span>
          </button>
          <button className="hub-action-card" onClick={() => setActiveSection("analytics")}>
            <div className="hub-action-icon">📊</div>
            <h3>Ver analytics</h3>
            <p>Métricas globales del proceso de reclutamiento</p>
            <span className="hub-action-arrow">→</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="hub-recent-activity">
        <h2>Actividad reciente</h2>
        <div className="hub-activity-list">
          <div className="hub-activity-item">
            <div className="hub-activity-icon green">✓</div>
            <div className="hub-activity-content">
              <strong>Candidato #1</strong> completó el assessment
              <span className="hub-activity-time">Hace 2 horas</span>
            </div>
            <button className="hub-activity-btn" onClick={() => setActiveSection("candidates")}>Ver →</button>
          </div>
          <div className="hub-activity-item">
            <div className="hub-activity-icon blue">▶</div>
            <div className="hub-activity-content">
              <strong>Candidato #2</strong> empezó el assessment
              <span className="hub-activity-time">Hace 5 horas</span>
            </div>
            <button className="hub-activity-btn" onClick={() => setActiveSection("candidates")}>Ver →</button>
          </div>
          <div className="hub-activity-item">
            <div className="hub-activity-icon orange">📩</div>
            <div className="hub-activity-content">
              <strong>3 nuevos candidatos</strong> aplicaron a la posición de ejemplo
              <span className="hub-activity-time">Ayer</span>
            </div>
            <button className="hub-activity-btn" onClick={() => setActiveSection("candidates")}>Ver →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════ CANDIDATES SECTION ═══════════════════════
function CandidatesSection() {
  return (
    <div className="hub-section hub-section-embedded">
      <RecruiterDashboard />
    </div>
  )
}

// ═══════════════════════ ASSESSMENTS SECTION ═══════════════════════
function AssessmentsSection() {
  return (
    <div className="hub-section">
      <div className="hub-section-header">
        <h1>📋 Assessments</h1>
        <p>Gestioná las posiciones abiertas y sus assessments</p>
      </div>

      <div className="hub-placeholder">
        <div className="hub-placeholder-icon">🚧</div>
        <h2>Próximamente</h2>
        <p>En esta sección vas a poder:</p>
        <ul>
          <li>✓ Crear nuevas posiciones</li>
          <li>✓ Configurar qué challenges incluir en cada assessment</li>
          <li>✓ Definir las dimensiones a evaluar</li>
          <li>✓ Invitar candidatos por email</li>
          <li>✓ Ver el estado de cada assessment en tiempo real</li>
        </ul>
      </div>
    </div>
  )
}

// ═══════════════════════ ANALYTICS SECTION ═══════════════════════
function AnalyticsSection() {
  return (
    <div className="hub-section">
      <div className="hub-demo-banner">
        <span className="hub-demo-badge">DEMO</span>
        <span>Los números reales aparecen cuando empiezan a entrar candidatos a tus posiciones.</span>
      </div>

      <div className="hub-section-header">
        <h1>📊 Analytics</h1>
        <p>Métricas globales de tu proceso de reclutamiento</p>
      </div>

      <div className="hub-stats-grid">
        <div className="hub-stat-card">
          <div className="hub-stat-icon">🎯</div>
          <div className="hub-stat-value">—</div>
          <div className="hub-stat-label">Tasa de match</div>
        </div>
        <div className="hub-stat-card">
          <div className="hub-stat-icon">⏱️</div>
          <div className="hub-stat-value">—</div>
          <div className="hub-stat-label">Reducción tiempo hire</div>
        </div>
        <div className="hub-stat-card">
          <div className="hub-stat-icon">👥</div>
          <div className="hub-stat-value">—</div>
          <div className="hub-stat-label">Candidatos evaluados</div>
        </div>
        <div className="hub-stat-card">
          <div className="hub-stat-icon">🏢</div>
          <div className="hub-stat-value">—</div>
          <div className="hub-stat-label">Posiciones abiertas</div>
        </div>
      </div>

      <div className="hub-placeholder">
        <div className="hub-placeholder-icon">📈</div>
        <h2>Dashboard avanzado próximamente</h2>
        <p>Vas a poder ver:</p>
        <ul>
          <li>✓ Distribución de scores por dimensión</li>
          <li>✓ Comparativa de candidatos por posición</li>
          <li>✓ Tendencias temporales</li>
          <li>✓ Red flags más comunes</li>
          <li>✓ Tiempo promedio de assessment</li>
        </ul>
      </div>
    </div>
  )
}

// ═══════════════════════ SETTINGS SECTION ═══════════════════════
function SettingsSection() {
  return (
    <div className="hub-section">
      <div className="hub-section-header">
        <h1>⚙️ Configuración</h1>
        <p>Personalizá tu cuenta y preferencias</p>
      </div>

      <div className="hub-settings-card">
        <h3>Perfil</h3>
        <div className="hub-settings-row">
          <label>Nombre</label>
          <input type="text" defaultValue="Recruiter Demo" />
        </div>
        <div className="hub-settings-row">
          <label>Email</label>
          <input type="email" defaultValue="recruiter@smatch.com" />
        </div>
        <div className="hub-settings-row">
          <label>Empresa</label>
          <input type="text" defaultValue="TechCorp" />
        </div>
      </div>

      <div className="hub-settings-card">
        <h3>Notificaciones</h3>
        <div className="hub-settings-toggle">
          <label>
            <input type="checkbox" defaultChecked />
            <span>Notificarme cuando un candidato complete un assessment</span>
          </label>
        </div>
        <div className="hub-settings-toggle">
          <label>
            <input type="checkbox" defaultChecked />
            <span>Resumen semanal por email</span>
          </label>
        </div>
        <div className="hub-settings-toggle">
          <label>
            <input type="checkbox" />
            <span>Alertas de red flags detectados</span>
          </label>
        </div>
      </div>

      <div className="hub-placeholder">
        <div className="hub-placeholder-icon">🔒</div>
        <h2>Más opciones próximamente</h2>
        <p>Permisos de equipo, integraciones, billing y más.</p>
      </div>
    </div>
  )
}
