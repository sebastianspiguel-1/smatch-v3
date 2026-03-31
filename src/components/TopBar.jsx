import { T } from "../theme"

export default function TopBar({
  title,
  subtitle,
  timer,
  score,
  progress,
  currentStep,
  totalSteps,
  onBack,
  backButton
}) {
  const backHandler = backButton?.onClick || onBack
  const backLabel = backButton?.label || "← Volver"

  return (
    <>
      <div style={{
        background: T.panel,
        borderBottom: `1px solid ${T.border}`,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        {/* Left: Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {backHandler && (
            <button
              onClick={backHandler}
              style={{
                background: "none",
                border: "none",
                color: T.dim,
                fontSize: 14,
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 6,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.target.style.color = T.teal}
              onMouseLeave={e => e.target.style.color = T.dim}
            >
              {backLabel}
            </button>
          )}
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 800,
              color: T.text,
              lineHeight: 1.2
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                fontSize: 12,
                color: T.dim,
                marginTop: 2
              }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Center: Progress Steps */}
        {(progress || (currentStep && totalSteps)) && (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
            {progress || (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>
                  Paso {currentStep} de {totalSteps}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i < currentStep ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: i < currentStep ? T.teal : `${T.teal}20`,
                        transition: "all 0.3s ease"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Right: Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {score !== undefined && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            background: `${T.orange}15`,
            borderRadius: 8,
            border: `1px solid ${T.orange}30`
          }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{
              fontSize: 16,
              fontWeight: 800,
              color: T.orange
            }}>
              {score}
            </span>
          </div>
        )}
        {timer && (
          <div style={{
            fontFamily: "monospace",
            fontSize: 18,
            fontWeight: 700,
            color: timer.warning ? T.orange : T.sub,
            padding: "4px 12px",
            background: timer.warning ? `${T.orange}10` : T.card,
            borderRadius: 8
          }}>
            {timer.display}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
