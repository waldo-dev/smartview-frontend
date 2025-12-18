import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import DashboardsList from './pages/Dashboards/DashboardsList'
import DashboardView from './pages/Dashboards/DashboardView'
import Profile from './pages/Profile/Profile'
import Companies from './pages/Companies/Companies'
import CompanyDashboards from './pages/CompanyDashboards/CompanyDashboards'
import CompanyAssignments from './pages/CompanyAssignments/CompanyAssignments'
import './App.css'

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboards" element={<DashboardsList />} />
        <Route path="dashboards/:id" element={<DashboardView />} />
        <Route path="profile" element={<Profile />} />
        <Route path="companies" element={<Companies />} />
        <Route path="company-dashboards" element={<CompanyDashboards />} />
        {/* Solo role_id = 1 podrá ver el contenido de esta ruta (controlado en el componente) */}
        <Route path="company-assignments" element={<CompanyAssignments />} />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App


