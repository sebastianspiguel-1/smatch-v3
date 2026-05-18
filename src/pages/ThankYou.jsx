import { useNavigate } from "react-router-dom"
import "./ThankYou.css"

export default function ThankYou() {
  const nav = useNavigate()

  return (
    <div className="thankyou-page">
      <div className="thankyou-bg">
        <div className="thankyou-shape shape-1" />
        <div className="thankyou-shape shape-2" />
        <div className="thankyou-shape shape-3" />
      </div>

      <div className="thankyou-container">
        <div className="thankyou-emoji">🎉</div>

        <h1 className="thankyou-title">
          ¡Gracias por completar tu <span className="gradient-text">Setlist Challenge</span>!
        </h1>

        <p className="thankyou-subtitle">
          Acabás de demostrar tus habilidades como Scrum Master a través de 6 situaciones reales del equipo Setlist.
        </p>

        <div className="thankyou-card">
          <div className="thankyou-card-icon">📊</div>
          <h2>¿Qué pasa ahora?</h2>
          <p>
            Tus respuestas y decisiones quedaron registradas y van a ser evaluadas por el equipo de recruiting.
          </p>
          <p>
            <strong>El recruiter va a recibir un reporte detallado</strong> con tu performance en cada dimensión: facilitación, coaching, gestión de stakeholders, pensamiento sistémico y más.
          </p>
          <p className="thankyou-card-highlight">
            En las próximas <strong>48-72 horas</strong> el equipo se va a poner en contacto con vos para los próximos pasos.
          </p>
        </div>

        <div className="thankyou-stats">
          <div className="thankyou-stat">
            <div className="thankyou-stat-value">6/6</div>
            <div className="thankyou-stat-label">Challenges completados</div>
          </div>
          <div className="thankyou-stat">
            <div className="thankyou-stat-value">✓</div>
            <div className="thankyou-stat-label">Assessment finalizado</div>
          </div>
          <div className="thankyou-stat">
            <div className="thankyou-stat-value">📩</div>
            <div className="thankyou-stat-label">Reporte enviado al recruiter</div>
          </div>
        </div>

        <div className="thankyou-actions">
          <button className="thankyou-btn-primary" onClick={() => nav("/")}>
            Volver al inicio
          </button>
        </div>

        <p className="thankyou-footer">
          ¿Tenés preguntas? Escribinos a <a href="mailto:hola@smatch.com">hola@smatch.com</a>
        </p>
      </div>
    </div>
  )
}
