import { T } from "../theme"

export default function ProgressBar({ steps, current }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 0"
    }}>
      {steps.map((step, idx) => {
        const isCompleted = idx < current
        const isCurrent = idx === current
        const isPending = idx > current

        return (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              background: isCompleted ? `${T.green}15` : isCurrent ? `${T.teal}15` : "transparent",
              border: `2px solid ${isCompleted ? T.green : isCurrent ? T.teal : T.border}`,
              transition: "all 0.3s"
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: isCompleted ? T.green : isCurrent ? T.teal : T.card,
                color: isCompleted || isCurrent ? T.bg : T.dim,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700
              }}>
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: isCurrent ? 700 : 600,
                color: isCompleted ? T.green : isCurrent ? T.teal : T.dim
              }}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                width: 24,
                height: 2,
                background: isCompleted ? T.green : T.border,
                transition: "all 0.3s"
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
