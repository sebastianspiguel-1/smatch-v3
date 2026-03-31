import { useState, useEffect } from "react"
import { T, QUALITY } from "../theme"
import "./FeedbackToast.css"

export default function FeedbackToast({ feedback, onDismiss, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onDismiss) onDismiss()
    }, 300)
  }

  if (!isVisible || !feedback) return null

  const qualityData = QUALITY[feedback.quality] || QUALITY.developing

  return (
    <div
      className={`feedback-toast ${isExiting ? 'exiting' : ''}`}
      onClick={handleDismiss}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        maxWidth: 400,
        background: T.panel,
        border: `2px solid ${qualityData.color}`,
        borderRadius: 12,
        padding: "16px",
        boxShadow: `0 8px 32px ${qualityData.color}40`,
        cursor: "pointer",
        zIndex: 1000
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span style={{ fontSize: 20 }}>{qualityData.emoji}</span>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: qualityData.color
          }}>
            {qualityData.label}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: T.dim,
            fontSize: 18,
            cursor: "pointer",
            padding: 0,
            width: 24,
            height: 24
          }}
        >
          ×
        </button>
      </div>

      {/* Feedback text */}
      <p style={{
        fontSize: 13,
        color: T.sub,
        lineHeight: 1.5,
        margin: "0 0 12px 0"
      }}>
        {feedback.feedback}
      </p>

      {/* Scores */}
      {feedback.scores && Object.keys(feedback.scores).length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6
        }}>
          {Object.entries(feedback.scores).map(([dimension, score]) => {
            const color = score >= 4 ? T.green : score >= 3 ? T.blue : score >= 2 ? T.orange : T.red
            return (
              <div
                key={dimension}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
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
}
