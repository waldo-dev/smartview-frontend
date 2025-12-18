import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { companyService } from '../../services/companyService'
import { dashboardService } from '../../services/dashboardService'
import './CompanyDashboards.css'

const CompanyDashboards = () => {
  const { user } = useAuth()
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company_id: ''
  })
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const isSuperAdmin = user?.role_id === 1

  // Solo role_id = 1 puede ver esta vista
  if (!isSuperAdmin) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Dashboards por Compañía</h1>
          <p>No tienes permisos para acceder a esta vista.</p>
        </div>
      </div>
    )
  }

  // Cargar compañías para el selector
  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({})
      const data = response.data || response
      const items = data.items || data.results || data.rows || data
      setCompanies(items)
      // Si no hay compañía seleccionada, seleccionar la primera
      if (!selectedCompanyId && items.length > 0) {
        setSelectedCompanyId(items[0].id)
      }
    } catch (err) {
      console.error('Error al cargar compañías:', err)
      const message = err.response?.data?.message || err.message || 'Error al cargar compañías'
      setError(message)
    }
  }

  const loadDashboards = async (companyId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await dashboardService.getDashboards({
        companyId: companyId || selectedCompanyId
      })
      const data = response.data || response
      const items = data.items || data.results || data.rows || data
      setDashboards(items)
    } catch (err) {
      console.error('Error al cargar dashboards:', err)
      const message = err.response?.data?.message || err.message || 'Error al cargar dashboards'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Primero compañías, luego dashboards
    const init = async () => {
      setLoading(true)
      await loadCompanies()
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedCompanyId) {
      loadDashboards(selectedCompanyId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId])

  const handleCompanyChange = (e) => {
    setSelectedCompanyId(e.target.value)
  }

  const handleSync = async () => {
    if (!selectedCompanyId) return
    setSyncing(true)
    setError(null)

    try {
      await dashboardService.syncDashboards(selectedCompanyId)
      await loadDashboards(selectedCompanyId)
    } catch (err) {
      console.error('Error al sincronizar dashboards:', err)
      const message =
        err.response?.data?.message || err.message || 'Error al sincronizar dashboards desde Power BI'
      setError(message)
    } finally {
      setSyncing(false)
    }
  }

  const openCreateModal = () => {
    setEditingDashboard(null)
    setFormData({
      name: '',
      description: '',
      company_id: selectedCompanyId || (companies[0] && companies[0].id) || ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (dashboard) => {
    setEditingDashboard(dashboard)
    setFormData({
      name: dashboard.name || '',
      description: dashboard.description || '',
      company_id: dashboard.company_id || selectedCompanyId || ''
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDashboard(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        company_id: formData.company_id || selectedCompanyId
      }

      if (!payload.company_id) {
        throw new Error('Debe seleccionar una compañía')
      }

      if (editingDashboard) {
        await dashboardService.updateDashboard(editingDashboard.id, payload)
      } else {
        await dashboardService.createDashboard(payload)
      }

      closeModal()
      await loadDashboards(payload.company_id)
    } catch (err) {
      console.error('Error al guardar dashboard:', err)
      const message = err.response?.data?.message || err.message || 'Error al guardar el dashboard'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const getCompanyName = (companyId) => {
    const c = companies.find((c) => c.id === companyId)
    return c?.name || '—'
  }

  return (
    <div className="company-dashboards-page">
      <div className="page-header">
        <h1>Dashboards por Compañía</h1>
        <p>Asigna dashboards a las compañías y gestiona su información básica.</p>
      </div>

      <div className="company-dashboards-toolbar">
        <div className="company-filter">
          <label htmlFor="company-select">Compañía</label>
          <select
            id="company-select"
            value={selectedCompanyId}
            onChange={handleCompanyChange}
            disabled={companies.length === 0}
          >
            {companies.length === 0 && <option>No hay compañías</option>}
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="company-dashboards-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleSync}
            disabled={!selectedCompanyId || companies.length === 0 || syncing}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar desde Power BI'}
          </button>
          <button
            className="btn-primary"
            onClick={openCreateModal}
            disabled={!selectedCompanyId || companies.length === 0}
          >
            + Nuevo Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-container" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="company-dashboards-card">
        {loading && dashboards.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando dashboards...</p>
          </div>
        ) : dashboards.length > 0 ? (
          <div className="company-dashboards-table-wrapper">
            <table className="company-dashboards-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Compañía</th>
                  <th style={{ width: '1%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dashboards.map((dashboard) => (
                  <tr key={dashboard.id}>
                    <td>{dashboard.name}</td>
                    <td>{dashboard.description || '—'}</td>
                    <td>{getCompanyName(dashboard.company_id)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => openEditModal(dashboard)}
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {selectedCompanyId
                ? 'Esta compañía aún no tiene dashboards asignados.'
                : 'Selecciona una compañía para ver sus dashboards.'}
            </p>
            {selectedCompanyId && (
              <button className="btn-primary" onClick={openCreateModal}>
                Crear primer dashboard
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal creación/edición */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingDashboard ? 'Editar Dashboard' : 'Nuevo Dashboard'}</h2>
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
                  placeholder="Nombre del dashboard"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descripción (opcional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_id">Compañía</label>
                <select
                  id="company_id"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una compañía</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
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

export default CompanyDashboards


