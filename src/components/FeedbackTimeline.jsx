import { T, QUALITY } from "../theme"

export default function FeedbackTimeline({ feedbackList, phaseLabels = {} }) {
  if (!feedbackList || feedbackList.length === 0) {
    return (
      <div style={{
        padding: 20,
        textAlign: "center",
        color: T.dim,
        fontSize: 13
      }}>
        No hay feedback todavía
      </div>
    )
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: "12px 0"
    }}>
      {feedbackList.map((fb, idx) => {
        const qualityData = QUALITY[fb.quality] || QUALITY.developing
        const phaseLabel = phaseLabels[fb.phase] || fb.phase

        return (
          <div
            key={idx}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderLeft: `4px solid ${qualityData.color}`,
              borderRadius: 8,
              padding: 12,
              transition: "all 0.2s"
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.dim,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>
                {phaseLabel}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 700,
                color: qualityData.color
              }}>
                <span>{qualityData.emoji}</span>
                <span>{qualityData.label}</span>
              </div>
            </div>

            {/* Feedback text */}
            <p style={{
              fontSize: 12,
              color: T.sub,
              lineHeight: 1.4,
              margin: "0 0 8px 0"
            }}>
              {fb.feedback}
            </p>

            {/* Scores */}
            {fb.scores && Object.keys(fb.scores).length > 0 && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4
              }}>
                {Object.entries(fb.scores).map(([dimension, score]) => {
                  const color = score >= 4 ? T.green : score >= 3 ? T.blue : score >= 2 ? T.orange : T.red
                  return (
                    <div
                      key={dimension}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: `${color}18`,
                        color: color
                      }}
                    >
                      {dimension}: {score}/4
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
