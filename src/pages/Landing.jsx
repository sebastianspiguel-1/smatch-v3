import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "./Landing.css"

export default function Landing() {
  const nav = useNavigate()
  const [scrollPct, setScrollPct] = useState(0)
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginTab, setLoginTab] = useState("candidate") // candidate | recruiter
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPass, setLoginPass] = useState("")
  const [contactForm, setContactForm] = useState({ nombre: "", email: "", empresa: "", tipo: "", mensaje: "" })

  // Scroll effects
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(h > 0 ? (window.scrollY / h) * 100 : 0)
      setNavScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 968) setMobileOpen(false) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // ESC to close login
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setLoginOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = (loginOpen || mobileOpen) ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [loginOpen, mobileOpen])

  function scrollTo(id) {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleStartAssessment(e) {
    e.preventDefault()
    setLoginOpen(true)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (loginTab === "candidate") {
      // Candidate login - go to challenges
      setLoginOpen(false)
      nav("/challenges")
    } else {
      // Recruiter login - instant access to hub
      setLoginOpen(false)
      nav("/recruiter")
    }
  }

  function handleContact(e) {
    e.preventDefault()
    console.log("Contact form:", contactForm)
    alert("¡Gracias por tu interés! Te contactaremos pronto a " + contactForm.email)
    setContactForm({ nombre: "", email: "", empresa: "", tipo: "", mensaje: "" })
  }

  return (
    <div className="landing-page">
      {/* Scroll progress */}
      <div className="scroll-indicator" style={{ width: `${scrollPct}%` }} />

      {/* ═══ NAV ═══ */}
      <nav className={`landing-nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <button className="logo" onClick={() => scrollTo("home")}>SMatch</button>
          <ul className={`nav-links ${mobileOpen ? "active" : ""}`}>
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home") }}>Home</a></li>
            <li><a href="#producto" onClick={(e) => { e.preventDefault(); scrollTo("producto") }}>Producto</a></li>
            <li><a href="#como-funciona" onClick={(e) => { e.preventDefault(); scrollTo("como-funciona") }}>Cómo funciona</a></li>
            <li><a href="#experiencias" onClick={(e) => { e.preventDefault(); scrollTo("experiencias") }}>Experiencias</a></li>
            <li><a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo("contacto") }}>Contacto</a></li>
            <li>
              <button className="nav-login-btn nav-login-recruiter" onClick={() => { setLoginTab("recruiter"); setLoginOpen(true); setMobileOpen(false) }}>
                Recruiter Login
              </button>
            </li>
            <li>
              <button className="nav-login-btn nav-login-candidate" onClick={() => { setLoginTab("candidate"); setLoginOpen(true); setMobileOpen(false) }}>
                Candidate Login
              </button>
            </li>
            <li><a href="https://calendly.com" target="_blank" rel="noreferrer" className="nav-btn-secondary">Agendar demo</a></li>
          </ul>
          <button className={`mobile-menu-toggle ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ═══ HERO V3 — Text-only centered with ambient color ═══ */}
      <section id="home" className="hero-v3 hero-v3-center">
        <div className="hero-v3-ambient" aria-hidden="true" />
        <div className="hero-v3-halo" aria-hidden="true" />
        <div className="hero-v3-stars" aria-hidden="true" />
        <div className="hero-v3-stars hero-v3-stars-2" aria-hidden="true" />
        <div className="hero-v3-text hero-v3-text-center">
          <h1 className="hero-v3-headline">
            <span className="hero-v3-line">Contratá Scrum Masters y Project Managers</span>
            <span className="hero-v3-line">que generen <em className="hero-v3-accent">impacto real</em></span>
          </h1>
          <p className="hero-v3-sub">
            El assessment con IA para evaluar roles de liderazgo en situaciones
            y contextos con desafíos reales. Evaluá lo correcto antes de contratar.
          </p>
          <a
            href="#producto"
            className="hero-v3-scroll-prompt"
            onClick={(e) => { e.preventDefault(); scrollTo("producto") }}
          >
            <span>Ver cómo funciona</span>
            <span className="hero-v3-scroll-arrow">↓</span>
          </a>
        </div>
      </section>

      {/* ═══ EL PROBLEMA ═══ */}
      <section id="problema" className="v3-section v3-section-light v3-problema">
        <div className="v3-container">
          <div className="v3-section-intro">
            <p className="v3-eyebrow">Contratar SMs y PMs es difícil</p>
            <h2 className="v3-section-headline">
              Contratar talento ágil<br />no debería ser una apuesta.
            </h2>
          </div>

          <div className="v3-problems-grid">
            {[
              {
                title: "Los CVs mienten.",
                desc: "Es fácil exagerar skills en papel. Las certificaciones no garantizan performance real.",
              },
              {
                title: "Las entrevistas son limitadas.",
                desc: "No revelan cómo alguien facilita, resuelve conflictos o maneja presión real. Los roles ágiles requieren evaluar desempeño, no solo conocimiento teórico.",
              },
              {
                title: "Contratar mal sale caro.",
                desc: "Un mal hire puede costar 3-5× el salario anual, con un alto riesgo de destruir al equipo.",
              },
            ].map((p) => (
              <div className="v3-problem-card" key={p.title}>
                <h4 className="v3-problem-title">{p.title}</h4>
                <p className="v3-problem-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CÓMO FUNCIONA — Flujo del recruiter (5 pasos) ═══ */}
      <section id="como-funciona" className="v3-section v3-funciona">
        <div className="v3-container">
          <div className="v3-section-intro">
            <p className="v3-eyebrow">Cómo funciona</p>
            <h2 className="v3-section-headline">De la oferta a la decisión, en una semana.</h2>
            <p className="v3-section-sub">
              Publicás la posición, el candidato vive un sprint completo,
              vos recibís un reporte con evidencia. Sin entrevistas a ciegas.
            </p>
          </div>

          <div className="v3-steps-list">
            {[
              { n: "01", title: "Publicá", desc: "Creás la posición en minutos y definís el perfil que buscás." },
              { n: "02", title: "Screening", desc: "Los candidatos aplican. A los que pasan el filtro inicial les enviás el assessment." },
              { n: "03", title: "Assessment", desc: "El candidato vive un Sprint 1 completo. 60-90 minutos. Cinco situaciones reales." },
              { n: "04", title: "Reporte", desc: "Recibís un reporte con seniority inferida, dimensiones y red flags. Comparás con data real." },
              { n: "05", title: "Decidís", desc: "Decisión con evidencia, no con intuición. Menos riesgo, menos tiempo." },
            ].map((s) => (
              <div className="v3-step-card" key={s.n}>
                <div className="v3-step-number">{s.n}</div>
                <div className="v3-step-content">
                  <h3 className="v3-step-title">{s.title}</h3>
                  <p className="v3-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EL PRODUCTO — con mockup del reporte ═══ */}
      <section id="producto" className="v3-section v3-section-light v3-producto">
        <div className="v3-container">
          <div className="v3-section-intro">
            <p className="v3-eyebrow">El producto</p>
            <h2 className="v3-section-headline">Evaluaciones basadas en situaciones reales.</h2>
            <p className="v3-section-sub">
              Simulaciones donde los candidatos demuestran cómo facilitan, resuelven
              conflictos y lideran bajo presión. Vos recibís un reporte con métricas
              objetivas para decidir con confianza.
            </p>
          </div>

          {/* Mockup CSS del reporte del recruiter */}
          <div className="v3-producto-mockup">
            <div className="v3-report-card">
              <div className="v3-report-header">
                <div className="v3-report-avatar">JL</div>
                <div className="v3-report-info">
                  <div className="v3-report-name">
                    Candidato
                    <span className="v3-report-tag">ASSESSMENT · 47 min</span>
                  </div>
                  <div className="v3-report-sub">Evaluación completa</div>
                </div>
                <div className="v3-report-score">
                  <div className="v3-report-grade">B</div>
                  <div className="v3-report-pct">77%</div>
                  <div className="v3-report-label">COMPETENTE</div>
                </div>
              </div>

              <div className="v3-report-divider" />

              <div className="v3-report-section-title">Dimensiones</div>
              <div className="v3-report-dims">
                {[
                  { label: "Facilitación", pct: 88, tone: "good" },
                  { label: "Coaching Humano", pct: 75, tone: "ok" },
                  { label: "Pensamiento Sistémico", pct: 76, tone: "ok" },
                  { label: "Dominio Scrum", pct: 78, tone: "ok" },
                  { label: "Stakeholders", pct: 74, tone: "ok" },
                  { label: "Fluidez IA", pct: 78, tone: "ai" },
                ].map((d) => (
                  <div className="v3-report-dim" key={d.label}>
                    <span className="v3-report-dim-label">{d.label}</span>
                    <div className="v3-report-dim-bar">
                      <div
                        className={`v3-report-dim-fill v3-report-dim-fill-${d.tone}`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="v3-report-dim-pct">{d.pct}%</span>
                  </div>
                ))}
              </div>

              <div className="v3-report-divider" />

              <div className="v3-report-cols">
                <div className="v3-report-col">
                  <div className="v3-report-col-title v3-report-col-title-good">Fortalezas</div>
                  <div className="v3-report-col-item">Detecta WIP overflow temprano</div>
                  <div className="v3-report-col-item">Argumenta con métricas concretas</div>
                  <div className="v3-report-col-item">Invita voces calladas explícitamente</div>
                </div>
                <div className="v3-report-col">
                  <div className="v3-report-col-title v3-report-col-title-warn">A desarrollar</div>
                  <div className="v3-report-col-item">Pierde oportunidades de coachear sesgos</div>
                  <div className="v3-report-col-item">Action items sin criterio de éxito</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POR QUÉ FUNCIONA ═══ */}
      <section className="v3-section v3-principles">
        <div className="v3-container">
          <div className="v3-section-intro">
            <p className="v3-eyebrow">Por qué funciona</p>
            <h2 className="v3-section-headline">Diseñado por gente que estuvo del otro lado.</h2>
            <p className="v3-section-sub">
              Construido por Scrum Masters y Project Managers senior
              con experiencia real en hiring ágil.
            </p>
          </div>

          <div className="v3-principles-grid v3-principles-grid-2">
            {[
              {
                title: "Escenarios reales, no teoría.",
                desc: "Cada challenge nace de situaciones que ocurren todos los días en equipos ágiles: bloqueos no escalados, devs apagados, scope creep, presión de management. Si el candidato sabe navegar esto, sabe hacer el trabajo.",
              },
              {
                title: "Output diseñado para decidir rápido.",
                desc: "El reporte no es un dump de números. Mostramos seniority inferida, dimensiones fuertes, red flags accionables y recomendación clara. Decisión en 5 minutos, no en 5 entrevistas.",
              },
            ].map((p) => (
              <div className="v3-principle-card" key={p.title}>
                <span className="v3-principle-mark" aria-hidden="true" />
                <h3 className="v3-principle-title">{p.title}</h3>
                <p className="v3-principle-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EL DIFERENCIADOR (climax antes del CTA) ═══ */}
      <section className="v3-section v3-section-light v3-diferenciador">
        <div className="v3-container">
          <p className="v3-eyebrow v3-eyebrow-light">El diferenciador</p>
          <h2 className="v3-mega-headline">
            Mientras otros prohíben la IA.
            <br />
            <span className="v3-mega-accent">Nosotros la medimos.</span>
          </h2>
          <p className="v3-mega-sub">
            Saber usar IA bien es la habilidad central del SM/PM moderno.
            Smatch trackea cómo el candidato la usa durante el assessment
            y lo evalúa como una dimensión más.
          </p>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section id="contacto" className="v3-section v3-cta-final">
        <div className="v3-container">
          <h2 className="v3-cta-headline">Empezá hoy.</h2>
          <p className="v3-cta-sub">
            15 minutos. Te mostramos el assessment, vos decidís si encaja.
          </p>
          <form
            className="v3-cta-form"
            onSubmit={(e) => { e.preventDefault(); handleContact(e) }}
          >
            <input
              type="email"
              placeholder="tu@empresa.com"
              value={contactForm.email}
              onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value, nombre: f.nombre || "—", empresa: f.empresa || "—", tipo: "demo" }))}
              required
              className="v3-cta-input"
            />
            <button type="submit" className="v3-cta-submit">
              Hablemos
              <span className="hero-v3-cta-arrow">→</span>
            </button>
          </form>
          <p className="v3-cta-microcopy">
            15 minutos. Te muestro el producto. Decidís si encaja.
          </p>
        </div>
      </section>

      {/* ═══ FOOTER minimal ═══ */}
      <footer className="v3-footer">
        <div className="v3-container">
          <div className="v3-footer-row">
            <div className="v3-footer-brand">
              Smatch
              <span className="v3-footer-tagline">— Contratá lo que ves.</span>
            </div>
            <div className="v3-footer-links">
              <a href="#producto" onClick={(e) => { e.preventDefault(); scrollTo("producto") }}>Producto</a>
              <a href="#como-funciona" onClick={(e) => { e.preventDefault(); scrollTo("como-funciona") }}>Cómo funciona</a>
              <a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo("contacto") }}>Demo</a>
              <a href="mailto:hola@smatch.com">hola@smatch.com</a>
            </div>
          </div>
          <div className="v3-footer-bottom">
            © 2026 Smatch
          </div>
        </div>
      </footer>

      {/* ═══ LOGIN MODAL ═══ */}
      {loginOpen && (
        <div className="login-overlay" onClick={(e) => { if (e.target === e.currentTarget) setLoginOpen(false) }}>
          <div className="login-modal-content">
            <button className="login-modal-close" onClick={() => setLoginOpen(false)}>×</button>
            <div className="login-header">
              <h2>Iniciar sesión</h2>
              <p>{loginTab === "candidate" ? "Ingresá como candidato para empezar el assessment" : "Ingresá como recruiter para gestionar posiciones"}</p>
            </div>
            <div className="login-tabs">
              <button className={`login-tab ${loginTab === "candidate" ? "active" : ""}`} onClick={() => setLoginTab("candidate")}>Candidato</button>
              <button className={`login-tab ${loginTab === "recruiter" ? "active" : ""}`} onClick={() => setLoginTab("recruiter")}>Recruiter</button>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" type="email" placeholder="tu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="login-pass">Password</label>
                <input id="login-pass" type="password" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleLogin(e) }} />
              </div>
              <button type="button" className="btn-submit" onClick={handleLogin}>
                {loginTab === "candidate" ? "Entrar y Empezar Assessment" : "Entrar como Recruiter"}
              </button>
              {loginTab === "candidate" && (
                <p className="login-hint">💡 <strong>Para la demo:</strong> Email: test@test.com | Password: test</p>
              )}
              {loginTab === "recruiter" && (
                <p className="login-hint">💡 <strong>Demo instantáneo:</strong> Dejá los campos vacíos y hacé click en "Entrar" para acceder al hub del recruiter.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
