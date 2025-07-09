import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { authTokenUtils } from './lib/api'
import SignIn from './pages/SignIn'
import Decrypt from './pages/Decrypt'
import Download from './pages/Download'

function App() {
  useEffect(() => {
    // 로컬 스토리지에서 토큰 복원
    const storedToken = localStorage.getItem('adminToken')
    if (storedToken) {
      try {
        const token = JSON.parse(storedToken)
        authTokenUtils.setToken(token.accessToken || token)
      } catch (error) {
        console.error('토큰 복원 오류:', error)
        localStorage.removeItem('adminToken')
      }
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route
          path="/signin"
          element={<SignIn />}
        />
        <Route
          path="/decrypt"
          element={<Decrypt />}
        />
        <Route
          path="/download"
          element={<Download />}
        />
        <Route
          path="/"
          element={
            <Navigate
              to="/signin"
              replace
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
