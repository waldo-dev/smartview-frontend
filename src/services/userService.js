import api from './authService'

// Servicio para gestionar usuarios (especialmente por compañía)
export const userService = {
  // Obtener usuarios de una compañía
  // Idealmente tu backend expone: GET /api/companies/:company_id/users
  async getCompanyUsers(companyId) {
    const response = await api.get(`/companies/${companyId}/users`)
    const payload = response.data || {}
    return payload.data || payload
  }
}

export default userService


