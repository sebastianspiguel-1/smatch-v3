import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import ChallengeMenu from "./pages/ChallengeMenu"
import Challenge01 from "./challenges/Challenge01"

// Importá futuros challenges acá:
// import Challenge02 from "./challenges/Challenge02"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/challenges" element={<ChallengeMenu />} />
        <Route path="/challenge/1" element={<Challenge01 />} />
        {/* Futuros:
        <Route path="/challenge/2" element={<Challenge02 />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/positions" element={<ManagePositions />} />
        */}
      </Routes>
    </BrowserRouter>
  )
}
