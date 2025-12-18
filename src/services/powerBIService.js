import api from './authService'

export const powerBIService = {
  // Obtener lista de dashboards disponibles
  async getDashboards() {
    const response = await api.get('/powerbi/dashboards')
    return response.data
  },

  // Obtener embed token para un dashboard específico
  async getEmbedToken(dashboardId) {
    const response = await api.get(`/powerbi/dashboards/${dashboardId}/embed-token`)
    return response.data
  },

  // Obtener información de un dashboard
  async getDashboard(dashboardId) {
    const response = await api.get(`/powerbi/dashboards/${dashboardId}`)
    return response.data
  }
}


