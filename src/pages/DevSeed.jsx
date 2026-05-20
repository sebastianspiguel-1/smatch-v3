import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { seedMockJourney, clearMockJourney, MOCK_RESULTS_KEY_PREFIX } from "../dev/seedMockJourney"
import { DEFAULT_CANDIDATE_ID, getProfile } from "../engine/candidateProfile"

export default function DevSeed() {
  const nav = useNavigate()
  const [status, setStatus] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)

  const cacheKey = MOCK_RESULTS_KEY_PREFIX + DEFAULT_CANDIDATE_ID
  const cached = (() => {
    try {
      const raw = localStorage.getItem(cacheKey)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  function handleSeed() {
    const res = seedMockJourney(DEFAULT_CANDIDATE_ID)
    setStatus(res)
    setProfilePreview(getProfile(DEFAULT_CANDIDATE_ID))
  }

  function handleClear() {
    clearMockJourney(DEFAULT_CANDIDATE_ID)
    setStatus(null)
    setProfilePreview(null)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button
          onClick={() => nav("/")}
          style={{
            background: "transparent",
            border: `1px solid ${T.border}`,
            color: T.sub,
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 24,
            fontSize: 12,
          }}
        >
          ← Inicio
        </button>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 3,
              color: T.teal,
              marginBottom: 8,
            }}
          >
            DEV · END-TO-END
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px 0" }}>
            Sembrar mock journey
          </h1>
          <p style={{ color: T.sub, lineHeight: 1.6, margin: 0 }}>
            Página interna para validar el reporte. El reporte público de demostración para
            inversores/clientes vive en{" "}
            <a
              href="/report/demo"
              style={{ color: T.teal, textDecoration: "underline" }}
            >
              /report/demo
            </a>{" "}
            (se siembra solo al entrar).
          </p>
          <p style={{ color: T.sub, lineHeight: 1.6, margin: "12px 0 0 0" }}>
            Acá podés sembrar manualmente sobre el candidato{" "}
            <code style={{ color: T.teal }}>{DEFAULT_CANDIDATE_ID}</code> si necesitás iterar
            sobre data de tests.
          </p>
        </div>

        <div
          style={{
            background: T.panel,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: T.sub }}>
            ESTADO ACTUAL
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div>
              Resultados sembrados:{" "}
              <strong style={{ color: cached ? T.green : T.dim }}>
                {cached ? `${cached.length} challenges` : "ninguno"}
              </strong>
            </div>
            <div>
              Profile en localStorage:{" "}
              <strong style={{ color: T.sub }}>
                {`smatch_profile_${DEFAULT_CANDIDATE_ID}`}
              </strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            onClick={handleSeed}
            style={{
              flex: 1,
              padding: "14px 20px",
              background: T.teal,
              color: T.bg,
              border: "none",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            🌱 Sembrar mock journey
          </button>
          {cached && (
            <button
              onClick={handleClear}
              style={{
                padding: "14px 20px",
                background: "transparent",
                color: T.red,
                border: `1px solid ${T.red}40`,
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {status && (
          <div
            style={{
              background: `${T.green}15`,
              border: `1px solid ${T.green}40`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 8 }}>
              ✓ Sembrado OK
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: T.sub }}>
              {status.results} challenges (IDs: {status.challenges.join(", ")}) +{" "}
              {profilePreview?.ai_coach_usage?.total_calls || 0} interacciones con el coach.
            </div>
          </div>
        )}

        {(cached || status) && (
          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: T.sub }}>
              IR AL REPORTE
            </div>
            <button
              onClick={() => nav(`/report/${encodeURIComponent(DEFAULT_CANDIDATE_ID)}`)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: T.teal,
                color: T.bg,
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Ver reporte de {DEFAULT_CANDIDATE_ID} →
            </button>
          </div>
        )}

        <details style={{ marginTop: 16, color: T.dim, fontSize: 12 }}>
          <summary style={{ cursor: "pointer", color: T.sub }}>
            ¿Qué incluye el seed?
          </summary>
          <div style={{ marginTop: 12, lineHeight: 1.8 }}>
            <div>• <strong>C04 Día 1</strong> · Kickoff & Planning · Grade B</div>
            <div>• <strong>C03 Día 3</strong> · 1-1 con Alan · Grade B</div>
            <div>• <strong>C02 Día 5</strong> · Daily con bloqueo · Grade A</div>
            <div>• <strong>C05 Día 7</strong> · Reunión con Paula · Grade B</div>
            <div>• <strong>C01 Día 10</strong> · Retro · Grade A</div>
            <div style={{ marginTop: 10 }}>
              Profile: 7 patrones detectados, 6 fortalezas, 4 weaknesses, 6 notable moments, 7
              consultas a Lyra distribuidas en los 5 challenges.
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
