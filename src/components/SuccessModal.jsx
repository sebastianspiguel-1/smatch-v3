import "./SuccessModal.css"

export default function SuccessModal({ grade, score, onClose, onShareLinkedIn, onDownloadBadge, candidateId }) {
  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <button className="success-modal-close" onClick={onClose}>×</button>

        <div className="success-animation">
          <div className="success-check">✓</div>
        </div>

        <h2 className="success-title">¡Challenge Completado!</h2>
        <p className="success-subtitle">Excelente trabajo en este assessment</p>

        <div className="success-grade">
          <div className="grade-badge" style={{ color: grade.color, borderColor: grade.color }}>
            <div className="grade-letter">{grade.letter}</div>
            <div className="grade-label">{grade.label}</div>
            <div className="grade-score">{Math.round(score)}%</div>
          </div>
        </div>

        <div className="success-message">
          <p>Tu desempeño ha sido evaluado y los resultados están disponibles para los recruiters.</p>
          <p><strong>¿Quieres destacar tu logro?</strong></p>
        </div>

        <div className="success-actions">
          <button className="btn-share linkedin" onClick={onShareLinkedIn}>
            <span className="btn-icon">in</span>
            Compartir en LinkedIn
          </button>
          <button className="btn-share download" onClick={onDownloadBadge}>
            <span className="btn-icon">📥</span>
            Descargar Badge
          </button>
        </div>

        <div className="success-next">
          <button className="btn-next-challenge" onClick={onClose}>
            Siguiente Challenge →
          </button>
          <button className="btn-view-report" onClick={() => window.location.href = `/report/${candidateId}`}>
            Ver Mi Reporte Completo
          </button>
        </div>

        <div className="success-footer">
          <p className="success-tip">💡 <strong>Tip:</strong> Completa todos los challenges para obtener un perfil completo y aumentar tus chances de match con empresas top.</p>
        </div>
      </div>
    </div>
  )
}
