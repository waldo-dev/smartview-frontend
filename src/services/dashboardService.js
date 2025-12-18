import api from './authService'

// Servicio para gestionar dashboards asociados a compañías y usuarios
export const dashboardService = {
  // GET /api/dashboards
  // Respuesta esperada:
  // { success: true, data: [ { id, name, description, powerbi_report_id, powerbi_workspace_id, is_active, company_id, company, users? } ] }
  async getDashboards({ companyId } = {}) {
    const params = {}
    if (companyId) params.company_id = companyId

    const response = await api.get('/dashboards', { params })
    const payload = response.data || {}
    return payload.data || payload
  },

  // POST /api/dashboards
  async createDashboard(data) {
    const response = await api.post('/dashboards', data)
    return response.data
  },

  // PUT /api/dashboards/:id
  async updateDashboard(id, data) {
    const response = await api.put(`/dashboards/${id}`, data)
    return response.data
  },

  // PUT /api/dashboards/:id/assign-company
  async assignCompany(id, companyId) {
    const response = await api.put(`/dashboards/${id}/assign-company`, {
      company_id: companyId
    })
    return response.data
  },

  // Sincronizar dashboards desde Power BI hacia la base de datos
  // Usa tu endpoint: POST /api/powerbi/dashboards/sync/:company_id
  async syncDashboards(companyId) {
    const response = await api.post(`/powerbi/dashboards/sync/${companyId}`)
    return response.data
  },

  // 1) Obtener todas las asignaciones de una empresa
  // GET /api/companies/:company_id/assignments
  // Devuelve: { success, data: { company, dashboards: [{ id, name, powerbi_report_id, users: [...] }] } }
  async getCompanyAssignments(companyId) {
    const response = await api.get(`/companies/${companyId}/assignments`)
    return response.data
  },

  // 2) Asignar un dashboard a múltiples usuarios de la empresa
  // POST /api/companies/:company_id/dashboards/:dashboard_id/assign-users
  async assignDashboardToUsers(companyId, dashboardId, userIds) {
    const response = await api.post(
      `/companies/${companyId}/dashboards/${dashboardId}/assign-users`,
      { user_ids: userIds }
    )
    return response.data
  },

  // 3) Asignar múltiples dashboards a un usuario de la empresa
  // POST /api/companies/:company_id/users/:user_id/assign-dashboards
  async assignDashboardsToUser(companyId, userId, dashboardIds) {
    const response = await api.post(
      `/companies/${companyId}/users/${userId}/assign-dashboards`,
      { dashboard_ids: dashboardIds }
    )
    return response.data
  }
}

export default dashboardService


