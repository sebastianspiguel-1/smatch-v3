import { useState, useRef, useEffect } from "react"
import { callAIText, buildAICoachPrompt } from "../engine/ai"
import { buildAIContextString, logAICoachUsage, DEFAULT_CANDIDATE_ID } from "../engine/candidateProfile"
import "./AICoach.css"

/**
 * AI Coach unified component for all challenges.
 *
 * Props:
 *   - challengeName: string, e.g. "El bloqueo que nadie escala"
 *   - challengeContext: string with current state summary for the coach prompt
 *   - candidateId: optional, defaults to DEFAULT_CANDIDATE_ID
 *   - maxInteractions: optional cap, default 10
 */
export default function AICoach({
  challengeName,
  challengeContext,
  candidateId = DEFAULT_CANDIDATE_ID,
  maxInteractions = 10,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversation, setConversation] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [conversation, loading])

  const interactionCount = conversation.filter(t => t.from === "sm").length
  const reachedLimit = interactionCount >= maxInteractions

  async function handleSend() {
    const text = input.trim()
    if (!text || loading || reachedLimit) return

    // Add SM message immediately
    const newConv = [...conversation, { from: "sm", text }]
    setConversation(newConv)
    setInput("")
    setLoading(true)

    // Build prompt + call AI
    const candidateContext = buildAIContextString(candidateId)
    const systemPrompt = buildAICoachPrompt(candidateContext, challengeContext, text, conversation)
    const response = await callAIText(systemPrompt, text, 250)

    setLoading(false)

    if (response) {
      setConversation([...newConv, { from: "coach", text: response }])
      // Log to profile
      logAICoachUsage(candidateId, {
        challenge: challengeName,
        sm_question: text,
        coach_response: response,
        copy_pasted: false, // se podría detectar después
      })
    } else {
      setConversation([
        ...newConv,
        { from: "coach", text: "No pude responder ahora. ¿Querés intentar de nuevo?" },
      ])
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          className="ai-coach-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Pedir ayuda al coach"
        >
          <span className="ai-coach-fab-icon">💡</span>
          <span className="ai-coach-fab-label">Consultar a Lyra</span>
          {interactionCount > 0 && (
            <span className="ai-coach-fab-badge">{interactionCount}</span>
          )}
        </button>
      )}

      {/* Side drawer */}
      {isOpen && (
        <>
          <div className="ai-coach-backdrop" onClick={() => setIsOpen(false)} />
          <div className="ai-coach-drawer" role="dialog" aria-label="Lyra — coach AI">
            <div className="ai-coach-header">
              <div className="ai-coach-header-info">
                <div className="ai-coach-title">
                  <span className="ai-coach-title-icon">💡</span>
                  Lyra
                </div>
                <div className="ai-coach-subtitle">
                  Tu sparring de IA. Hace preguntas, no da respuestas.
                </div>
              </div>
              <button
                className="ai-coach-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="ai-coach-messages" ref={messagesRef}>
              {conversation.length === 0 && (
                <div className="ai-coach-intro">
                  <p>
                    Soy Lyra. No te voy a decir qué hacer —
                    te voy a ayudar a <strong>pensar</strong>.
                  </p>
                  <p className="ai-coach-intro-hint">
                    Probá: "no sé qué hacer con el bloqueo" o "¿cómo abordo a alguien callado?"
                  </p>
                </div>
              )}

              {conversation.map((turn, i) => (
                <div
                  key={i}
                  className={`ai-coach-message ai-coach-message-${turn.from}`}
                >
                  <div className="ai-coach-message-author">
                    {turn.from === "sm" ? "Vos" : "Lyra"}
                  </div>
                  <div className="ai-coach-message-text">{turn.text}</div>
                </div>
              ))}

              {loading && (
                <div className="ai-coach-message ai-coach-message-coach">
                  <div className="ai-coach-message-author">Lyra</div>
                  <div className="ai-coach-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
            </div>

            <div className="ai-coach-input-area">
              {reachedLimit ? (
                <div className="ai-coach-limit-msg">
                  Llegaste al límite de {maxInteractions} consultas en este challenge.
                </div>
              ) : (
                <>
                  <textarea
                    className="ai-coach-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pedile algo al coach... (Enter para enviar)"
                    rows={2}
                    disabled={loading}
                  />
                  <button
                    className="ai-coach-send"
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                  >
                    Enviar
                  </button>
                </>
              )}
              <div className="ai-coach-counter">
                {interactionCount}/{maxInteractions} consultas
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
