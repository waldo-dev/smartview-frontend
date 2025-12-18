import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { powerBIService } from '../../services/powerBIService'
import './Dashboard.css'

const Dashboard = () => {
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

  if (loading) {
    return <div className="loading-container">Cargando...</div>
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard Principal</h1>
        <p>Bienvenido a tu panel de control</p>
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


