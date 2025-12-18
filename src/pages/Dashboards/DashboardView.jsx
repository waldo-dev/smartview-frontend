import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { powerBIService } from '../../services/powerBIService'
import PowerBIEmbed from '../../components/PowerBI/PowerBIEmbed'
import './Dashboards.css'

const DashboardView = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [embedConfig, setEmbedConfig] = useState(null)

  useEffect(() => {
    const loadDashboard = async () => {
      if (!id) {
        setError('ID de dashboard no proporcionado')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Obtener información del dashboard
        const dashboardData = await powerBIService.getDashboard(id)
        setDashboard(dashboardData)

        // Obtener embed token
        const embedData = await powerBIService.getEmbedToken(id)
        setEmbedConfig(embedData)

        setLoading(false)
      } catch (err) {
        console.error('Error al cargar el dashboard:', err)
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Error al cargar el dashboard. Verifica que el ID sea correcto y que tengas acceso.'
        setError(errorMessage)
        setLoading(false)
      }
    }

    loadDashboard()
  }, [id])

  if (loading) {
    return (
      <div className="dashboard-view-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-view-container">
        <div className="dashboard-view-header">
          <h1>Error al cargar el dashboard</h1>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <p className="error-details">
            ID: {id}
          </p>
        </div>
      </div>
    )
  }

  if (!embedConfig || !embedConfig.embedUrl || !embedConfig.accessToken) {
    return (
      <div className="dashboard-view-container">
        <div className="dashboard-view-header">
          <h1>Error de configuración</h1>
        </div>
        <div className="error-container">
          <p>No se pudo obtener el token de embed. Verifica la configuración del backend.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-view-container">
      <div className="dashboard-view-header">
        <h1>{dashboard?.name || 'Dashboard Power BI'}</h1>
        <p>Visualización interactiva de datos</p>
      </div>

      <div className="powerbi-container">
        <PowerBIEmbed
          embedUrl={embedConfig.embedUrl}
          accessToken={embedConfig.accessToken}
          embedId={embedConfig.embedId || embedConfig.id || id}
          embedType={embedConfig.embedType || embedConfig.type || 'report'}
          config={embedConfig.config || {}}
        />
      </div>
    </div>
  )
}

export default DashboardView


