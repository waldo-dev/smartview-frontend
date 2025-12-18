import api from './authService'

// Servicio para gestionar compañías
export const companyService = {
  // Obtener lista paginada de compañías
  async getCompanies({ page = 1, limit = 10 } = {}) {
    const response = await api.get('/companies', {
    })
    console.log("🚀 ~ response:", response)
    return response.data
  },

  // Crear nueva compañía
  async createCompany(data) {
    const response = await api.post('/companies', data)
    return response.data
  },

  // Actualizar compañía
  async updateCompany(id, data) {
    const response = await api.put(`/companies/${id}`, data)
    return response.data
  },

  // Eliminar compañía
  async deleteCompany(id) {
    const response = await api.delete(`/companies/${id}`)
    return response.data
  }
}

export default companyService



