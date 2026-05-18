import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import ChallengeMenu from "./pages/ChallengeMenu"
import CandidateReport from "./pages/CandidateReport"
import CandidateProgress from "./pages/CandidateProgress"
import ThankYou from "./pages/ThankYou"
import RecruiterDashboard from "./pages/RecruiterDashboard"
import RecruiterHub from "./pages/RecruiterHub"
import Challenge01 from "./challenges/Challenge01"
import Challenge02 from "./challenges/Challenge02"
import Challenge03 from "./challenges/Challenge03"
import Challenge04 from "./challenges/Challenge04"
import Challenge05 from "./challenges/Challenge05"
import Challenge06 from "./challenges/Challenge06"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/challenges" element={<ChallengeMenu />} />
        <Route path="/challenge/1" element={<Challenge01 />} />
        <Route path="/challenge/2" element={<Challenge02 />} />
        <Route path="/challenge/3" element={<Challenge03 />} />
        <Route path="/challenge/4" element={<Challenge04 />} />
        <Route path="/challenge/5" element={<Challenge05 />} />
        <Route path="/challenge/6" element={<Challenge06 />} />
        <Route path="/report/:id" element={<CandidateReport />} />
        <Route path="/resultados" element={<CandidateReport finalView />} />
        <Route path="/gracias" element={<ThankYou />} />
        <Route path="/mi-progreso" element={<CandidateProgress />} />
        <Route path="/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter" element={<RecruiterHub />} />
      </Routes>
    </BrowserRouter>
  )
}
