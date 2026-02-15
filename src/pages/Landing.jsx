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
      // TODO: Supabase auth
      if (loginEmail === "test@test.com" && loginPass === "test") {
        setLoginOpen(false)
        nav("/challenges")
      } else {
        alert("Credenciales incorrectas.\n\nPara la demo:\nEmail: test@test.com\nPassword: test")
      }
    } else {
      // Recruiter login
      alert("Recruiter login próximamente. Contactanos en hola@smatch.com")
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
            <li className="dropdown">
              <a href="#" className="dropdown-toggle" onClick={(e) => e.preventDefault()}>
                Login <span className="arrow">▼</span>
              </a>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => { setLoginTab("recruiter"); setLoginOpen(true); setMobileOpen(false) }}>
                  Login as Recruiter
                </button>
                <button className="dropdown-item" onClick={() => { setLoginTab("candidate"); setLoginOpen(true); setMobileOpen(false) }}>
                  Login as Candidate
                </button>
              </div>
            </li>
            <li><a href="#" className="nav-cta" onClick={handleStartAssessment}>Start Assessment →</a></li>
            <li><a href="https://calendly.com" target="_blank" rel="noreferrer" className="nav-btn-secondary">Schedule Demo</a></li>
          </ul>
          <button className={`mobile-menu-toggle ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="home" className="hero">
        <div className="hero-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content">
          <h1>Encuentra el <span className="gradient-text">talento ágil perfecto</span></h1>
          <p>Reduce el riesgo de malas contrataciones en roles ágiles —con data real de desempeño, verificado en contextos reales. Sin CVs inflados. Sin adivinar.</p>
          <div className="hero-ctas">
            <a href="#contacto" className="btn btn-primary" onClick={(e) => { e.preventDefault(); scrollTo("contacto") }}>Publicar Posición</a>
            <a href="#como-funciona" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); scrollTo("como-funciona") }}>Ver Cómo Funciona</a>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 1 ═══ */}
      <section id="producto" className="section">
        <div className="container">
          <div className="feature-section">
            <div className="feature-text">
              <h2>Donde los Scrum Masters demuestran sus skills jugando</h2>
              <p>No más entrevistas genéricas. No más adivinar si alguien puede facilitar un sprint o resolver un conflicto de equipo.</p>
              <p>En SMatch, los candidatos enfrentan simulaciones reales. Los ves en acción antes de contratarlos.</p>
            </div>
            <div className="feature-visual">
              <div className="visual-card">
                <h3>Assessment Validado</h3>
                {[["Facilitación", "95%"], ["Resolución de Conflictos", "88%"], ["Stakeholder Management", "92%"], ["Agilidad Real", "91%"]].map(([l, v]) => (
                  <div className="metric-row" key={l}>
                    <span className="metric-label">{l}</span>
                    <span className="metric-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEMS ═══ */}
      <section className="problems-section">
        <div className="section-header">
          <h2>El problema con el recruiting tradicional</h2>
          <p>Contratar talento ágil no debería ser una apuesta</p>
        </div>
        <div className="problems-grid">
          {[
            { icon: "📄", title: "Los CVs Mienten", desc: "Es fácil exagerar skills en papel. Las certificaciones no garantizan performance real." },
            { icon: "💬", title: "Entrevistas Limitadas", desc: "No revelan cómo alguien facilita, resuelve conflictos o maneja presión real. Los roles ágiles requieren evaluar desempeño real, no solo conocimiento teórico." },
            { icon: "💸", title: "Contratar Mal Sale Caro", desc: "Un mal hire puede costar 3-5x el salario anual, con un alto riesgo de destruir al equipo." },
          ].map(p => (
            <div className="problem-item" key={p.title}>
              <span className="problem-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURE 2 ═══ */}
      <section className="section">
        <div className="container">
          <div className="feature-section">
            <div className="feature-visual">
              <div className="visual-card">
                <h3>El Marketplace de Talento Ágil</h3>
                {[["Candidatos Validados", "1,247"], ["Empresas Activas", "89"], ["Tasa de Match", "94%"], ["Tiempo de Contratación", "-67%"]].map(([l, v]) => (
                  <div className="metric-row" key={l}>
                    <span className="metric-label">{l}</span>
                    <span className="metric-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="feature-text">
              <h2>Dashboards que revelan la verdad</h2>
              <p>Métricas objetivas. Rankings claros. Videos del assessment completo.</p>
              <p>Comparás candidatos con data real, no con impresiones subjetivas de una entrevista de 30 minutos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section id="como-funciona" className="timeline-section">
        <div className="timeline-header">
          <h2>Cómo funciona</h2>
          <p>Simple. Rápido. Efectivo.</p>
        </div>
        <div className="timeline">
          {[
            { icon: "📝", title: "Level 1: Publish", desc: "Publica tu Posición. Crea tu oferta en minutos y define el perfil que buscas." },
            { icon: "📬", title: "Level 2: Screen", desc: "Candidatos aplican. Una vez terminado el screening inicial, se procede a enviar los assessments." },
            { icon: "🎮", title: "Assessment Gamificado", desc: "Simulación de 60 minutos. Evaluación de impacto real en equipos con diferentes escenarios." },
            { icon: "📊", title: "Scoreboard", desc: "Recibe métricas claras, ranking objetivo y video completo del assessment. Compara candidatos con data real." },
            { icon: "💡", title: "Hire", desc: "Toma la decisión basada en datos y necesidades reales del producto. Disminuyendo riesgo, tiempos y errores de contratación." },
          ].map((t, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-number">{t.icon}</div>
              <div className="timeline-content">
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ EXPERIENCES ═══ */}
      <section id="experiencias" className="experiences-section">
        <div className="section-header">
          <h2>Lo que dicen nuestros clientes</h2>
        </div>
        <div className="experiences-grid">
          {[
            { avatar: "👩‍💼", name: "María González", role: "Head of Engineering @ TechCorp", text: "Finalmente pudimos ver a los candidatos en acción. El assessment reveló habilidades que nunca detectamos en entrevistas tradicionales. Contratamos a nuestra mejor Scrum Master en años." },
            { avatar: "👨‍💻", name: "Carlos Ramírez", role: "CTO @ StartupX", text: "Reducimos el tiempo de contratación de 8 semanas a 3. Y lo mejor: la tasa de retención subió al 95%. Los datos objetivos hacen toda la diferencia." },
            { avatar: "👩‍🔬", name: "Ana Torres", role: "VP of Product @ ScaleUp", text: "El dashboard nos permitió comparar 12 candidatos objetivamente. Identificamos red flags que habrían pasado desapercibidos. SMatch es game-changing." },
          ].map(t => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-header">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div className="testimonial-info">
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
              <div className="testimonial-text">"{t.text}"</div>
              <div className="rating">⭐⭐⭐⭐⭐</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="stats-section">
        <div className="stats-row">
          {[["1,200+", "Candidatos Validados"], ["94%", "Tasa de Match"], ["85+", "Empresas Confían"], ["-67%", "Reducción en Tiempo de Hiring"]].map(([n, l]) => (
            <div className="stat" key={l}>
              <div className="stat-number">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA + CONTACT ═══ */}
      <section id="contacto" className="cta-section">
        <div className="cta-content">
          <h2>Empecemos a trabajar juntos</h2>
          <p>¿Listo para contratar mejor talento ágil?</p>
          <div className="contact-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input id="nombre" value={contactForm.nombre} onChange={e => setContactForm(f => ({ ...f, nombre: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="empresa">Empresa</label>
              <input id="empresa" value={contactForm.empresa} onChange={e => setContactForm(f => ({ ...f, empresa: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="tipo">Estoy Interesado en:</label>
              <select id="tipo" value={contactForm.tipo} onChange={e => setContactForm(f => ({ ...f, tipo: e.target.value }))} required>
                <option value="">Seleccionar...</option>
                <option value="publicar">Publicar una Posición</option>
                <option value="demo">Agendar una Demo</option>
                <option value="pricing">Solicitar Pricing</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea id="mensaje" value={contactForm.mensaje} onChange={e => setContactForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Cuéntanos qué necesitas..." />
            </div>
            <button type="button" className="btn-submit" onClick={handleContact}>Enviar Mensaje</button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SMatch</h3>
            <p>El marketplace de talento ágil con assessments que realmente importan.</p>
          </div>
          <div className="footer-section">
            <h3>Producto</h3>
            <ul>
              <li><a href="#producto" onClick={(e) => { e.preventDefault(); scrollTo("producto") }}>Producto</a></li>
              <li><a href="#como-funciona" onClick={(e) => { e.preventDefault(); scrollTo("como-funciona") }}>Cómo Funciona</a></li>
              <li><a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo("contacto") }}>Pricing</a></li>
              <li><a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo("contacto") }}>Demo</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Empresa</h3>
            <ul>
              <li><a href="#experiencias" onClick={(e) => { e.preventDefault(); scrollTo("experiencias") }}>Testimonios</a></li>
              <li><a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo("contacto") }}>Contacto</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <ul>
              <li>hola@smatch.com</li>
              <li>LinkedIn (próximamente)</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SMatch. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* ═══ LOGIN MODAL ═══ */}
      {loginOpen && (
        <div className="login-overlay" onClick={(e) => { if (e.target === e.currentTarget) setLoginOpen(false) }}>
          <div className="login-modal-content">
            <button className="login-modal-close" onClick={() => setLoginOpen(false)}>×</button>
            <div className="login-header">
              <h2>🎯 Iniciar Sesión</h2>
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
                <p className="login-hint">💡 <strong>Recruiter dashboard:</strong> Próximamente. Contactanos para early access.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
