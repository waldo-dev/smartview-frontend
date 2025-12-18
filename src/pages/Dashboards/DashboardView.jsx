import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { powerBIService } from '../../services/powerBIService'
import './Dashboards.css'

const DashboardView = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const embedContainerRef = useRef(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Obtener información del dashboard y el embed token
        // const dashboard = await powerBIService.getDashboard(id)
        // const embedConfig = await powerBIService.getEmbedToken(id)
        
        // Aquí se integrará el embed de Power BI
        // Por ahora mostramos un placeholder
        
        setLoading(false)
      } catch (err) {
        setError('Error al cargar el dashboard')
        console.error(err)
        setLoading(false)
      }
    }

    if (id) {
      loadDashboard()
    }
  }, [id])

  if (loading) {
    return (
      <div className="dashboard-view-container">
        <div className="loading-container">Cargando dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-view-container">
        <div className="error-container">{error}</div>
      </div>
    )
  }

  return (
    <div className="dashboard-view-container">
      <div className="dashboard-view-header">
        <h1>Dashboard Power BI</h1>
        <p>Visualización interactiva de datos</p>
      </div>

      <div className="powerbi-container" ref={embedContainerRef}>
        <div className="powerbi-placeholder">
          <div className="placeholder-content">
            <span className="placeholder-icon">📊</span>
            <h2>Dashboard de Power BI</h2>
            <p>El dashboard se cargará aquí una vez configurado el embed token</p>
            <p className="placeholder-note">
              ID: {id}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView


