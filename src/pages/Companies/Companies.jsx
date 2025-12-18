import { useEffect, useState } from 'react'
import { companyService } from '../../services/companyService'
import './Companies.css'

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    email: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await companyService.getCompanies({ page, limit: pageSize })

      // Flexibilidad ante diferentes estructuras de respuesta
      const data = response.data || response
      const items = data.items || data.results || data.rows || data
      const totalItems = data.total || data.totalItems || items.length

      setCompanies(items)
      setTotal(totalItems)
    } catch (err) {
      console.error('Error al cargar compañías:', err)
      const message = err.response?.data?.message || err.message || 'Error al cargar compañías'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const openCreateModal = () => {
    setEditingCompany(null)
    setFormData({
      name: '',
      taxId: '',
      email: '',
      is_active: true
    })
    setIsModalOpen(true)
  }

  const openEditModal = (company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name || '',
      taxId: company.taxId || company.rut || '',
      email: company.email || '',
      is_active: company.is_active ?? true
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCompany(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: formData.name,
        taxId: formData.taxId,
        email: formData.email,
        is_active: formData.is_active
      }

      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, payload)
      } else {
        await companyService.createCompany(payload)
      }

      closeModal()
      // Volver a cargar desde la primera página para ver cambios
      setPage(1)
      await loadCompanies()
    } catch (err) {
      console.error('Error al guardar compañía:', err)
      const message = err.response?.data?.message || err.message || 'Error al guardar la compañía'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (company) => {
    const confirmDelete = window.confirm(`¿Eliminar la compañía "${company.name}"?`)
    if (!confirmDelete) return

    try {
      await companyService.deleteCompany(company.id)
      // Si se elimina la última de la página, ajustar página si es necesario
      if (companies.length === 1 && page > 1) {
        setPage((prev) => prev - 1)
      } else {
        await loadCompanies()
      }
    } catch (err) {
      console.error('Error al eliminar compañía:', err)
      const message = err.response?.data?.message || err.message || 'Error al eliminar la compañía'
      setError(message)
    }
  }

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
  }

  if (loading && companies.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando compañías...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="companies-page">
      <div className="page-header">
        <h1>Compañías</h1>
        <p>Administra las compañías que tendrán acceso a los dashboards</p>
      </div>

      <div className="companies-toolbar">
        <button className="btn-primary" onClick={openCreateModal}>
          + Nueva Compañía
        </button>
      </div>

      {error && (
        <div className="error-container" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="companies-card">
        <div className="companies-table-wrapper">
          {companies.length > 0 ? (
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT / Tax ID</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th style={{ width: '1%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>{company.taxId || company.rut || '-'}</td>
                    <td>{company.email || '-'}</td>
                    <td>
                      <span className={`status-badge ${company.is_active ? 'active' : 'inactive'}`}>
                        {company.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => openEditModal(company)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-link btn-danger-link"
                          onClick={() => handleDelete(company)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No hay compañías registradas aún</p>
              <button className="btn-primary" onClick={openCreateModal}>
                Crear primera compañía
              </button>
            </div>
          )}
        </div>

        {/* Paginación */}
        {companies.length > 0 && (
          <div className="pagination">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="pagination-info">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de creación/edición */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCompany ? 'Editar Compañía' : 'Nueva Compañía'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nombre de la compañía"
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId">RUT / Tax ID</label>
                <input
                  id="taxId"
                  name="taxId"
                  type="text"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="12345678-9"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email de contacto</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contacto@compania.cl"
                />
              </div>

              <div className="form-group form-group-inline">
                <label htmlFor="is_active">Activa</label>
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Companies



