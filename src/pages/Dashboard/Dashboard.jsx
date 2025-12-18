import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { powerBIService } from '../../services/powerBIService'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalDashboards: 0,
    recentDashboards: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos - reemplazar con llamada real a la API
    const loadData = async () => {
      try {
        // const dashboards = await powerBIService.getDashboards()
        // setStats({
        //   totalDashboards: dashboards.length,
        //   recentDashboards: dashboards.slice(0, 3)
        // })
        
        // Datos de ejemplo por ahora
        setStats({
          totalDashboards: 0,
          recentDashboards: []
        })
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Formatear fecha de creación
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return <div className="loading-container">Cargando...</div>
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="welcome-section">
          <div className="welcome-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="welcome-content">
            <h1>¡Bienvenido, {user?.name || 'Usuario'}! 👋</h1>
            <p>Gestiona y visualiza tus dashboards de manera eficiente</p>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="user-info-card">
        <div className="user-info-header">
          <h2>Información de tu cuenta</h2>
        </div>
        <div className="user-info-grid">
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Estado</span>
            <span className={`info-value status-badge ${user?.is_active ? 'active' : 'inactive'}`}>
              {user?.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Miembro desde</span>
            <span className="info-value">{formatDate(user?.createdAt) || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">ID de Usuario</span>
            <span className="info-value info-id">{user?.id || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalDashboards}</h3>
            <p>Dashboards Totales</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>1</h3>
            <p>Usuarios Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>0</h3>
            <p>Vistas Hoy</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Dashboards Recientes</h2>
          <Link to="/dashboards" className="view-all-link">
            Ver todos →
          </Link>
        </div>

        {stats.recentDashboards.length > 0 ? (
          <div className="dashboards-grid">
            {stats.recentDashboards.map((dashboard) => (
              <Link
                key={dashboard.id}
                to={`/dashboards/${dashboard.id}`}
                className="dashboard-card"
              >
                <h3>{dashboard.name}</h3>
                <p>{dashboard.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay dashboards disponibles aún</p>
            <Link to="/dashboards" className="btn-primary">
              Explorar Dashboards
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard


