import api from './authService'

export const powerBIService = {
  // Obtener lista de dashboards disponibles
  async getDashboards() {
    const response = await api.get('/powerbi/dashboards')
    // Manejar estructura de respuesta: { success: true, data: {...} } o directamente los datos
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return response.data
  },

  // Obtener embed token para un dashboard específico
  async getEmbedToken(dashboardId) {
    const response = await api.get(`/powerbi/dashboards/${dashboardId}/embed-token`)
    // Manejar estructura de respuesta: { success: true, data: {...} } o directamente los datos
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return response.data
  },

  // Obtener información de un dashboard
  async getDashboard(dashboardId) {
    const response = await api.get(`/powerbi/dashboards/${dashboardId}`)
    // Manejar estructura de respuesta: { success: true, data: {...} } o directamente los datos
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return response.data
  }
}


