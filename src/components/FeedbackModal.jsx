import { T, QUALITY, DIM_LABELS } from "../theme"
import "./FeedbackModal.css"

export default function FeedbackModal({ feedback, onContinue }) {
  if (!feedback) return null

  const qualityData = QUALITY[feedback.quality] || QUALITY.developing

  return (
    <div className="feedback-overlay" onClick={onContinue}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <div className="feedback-badge" style={{ color: qualityData.color }}>
            {qualityData.emoji} {qualityData.label}
          </div>
        </div>

        <div className="feedback-content">
          <p className="feedback-text">{feedback.feedback}</p>

          {feedback.scores && (
            <div className="feedback-scores">
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4 }}>
                {Object.entries(feedback.scores).map(([k, v]) => {
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
            </div>
          )}
        </div>

        <button className="feedback-continue-btn" onClick={onContinue}>
          Continuar →
        </button>
      </div>
    </div>
  )
}
