import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { powerBIService } from '../../services/powerBIService'
import './Dashboards.css'

const DashboardsList = () => {
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboards = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await powerBIService.getDashboards()
        setDashboards(response.dashboards || response || [])
      } catch (err) {
        console.error('Error al cargar los dashboards:', err)
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Error al cargar los dashboards'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadDashboards()
  }, [])

  if (loading) {
    return <div className="loading-container">Cargando dashboards...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="dashboards-page">
      <div className="page-header">
        <h1>Mis Dashboards</h1>
        <p>Gestiona y visualiza tus dashboards de Power BI</p>
      </div>

      {dashboards.length > 0 ? (
        <div className="dashboards-grid">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.id}
              to={`/dashboards/${dashboard.id}`}
              className="dashboard-card"
            >
              <div className="dashboard-thumbnail">
                <span className="thumbnail-icon">📊</span>
              </div>
              <div className="dashboard-info">
                <h3>{dashboard.name}</h3>
                <p>{dashboard.description || 'Sin descripción'}</p>
                <span className="dashboard-date">
                  Actualizado: {new Date(dashboard.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No hay dashboards disponibles</h2>
          <p>Los dashboards aparecerán aquí una vez que estén configurados</p>
        </div>
      )}
    </div>
  )
}

export default DashboardsList


