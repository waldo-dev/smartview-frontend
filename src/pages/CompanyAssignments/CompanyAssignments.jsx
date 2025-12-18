import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { companyService } from '../../services/companyService'
import { dashboardService } from '../../services/dashboardService'
import { userService } from '../../services/userService'
import './CompanyAssignments.css'

const CompanyAssignments = () => {
  const { user } = useAuth()
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')

  const [assignments, setAssignments] = useState(null)
  const [users, setUsers] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assigningDashboard, setAssigningDashboard] = useState(null)
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.role_id === 1

  // Solo role_id = 1 puede ver esta vista
  if (!isSuperAdmin) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Asignaciones de Dashboards</h1>
          <p>No tienes permisos para acceder a esta vista.</p>
        </div>
      </div>
    )
  }

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({})
      const data = response.data || response
      const items = data.items || data.results || data.rows || data
      setCompanies(items)
      if (!selectedCompanyId && items.length > 0) {
        setSelectedCompanyId(items[0].id)
      }
    } catch (err) {
      console.error('Error al cargar compañías:', err)
      const message = err.response?.data?.message || err.message || 'Error al cargar compañías'
      setError(message)
    }
  }

  const loadAssignments = async (companyId) => {
    try {
      setLoading(true)
      setError(null)
      const res = await dashboardService.getCompanyAssignments(companyId)
      const payload = res.data || res
      setAssignments(payload)
    } catch (err) {
      console.error('Error al cargar asignaciones:', err)
      const message = err.response?.data?.message || err.message || 'Error al cargar asignaciones'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async (companyId) => {
    try {
      const res = await userService.getCompanyUsers(companyId)
      const payload = res.data || res
      const items = payload.items || payload.results || payload.rows || payload
      setUsers(items)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      const message = err.response?.data?.message || err.message || 'Error al cargar usuarios'
      setError(message)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await loadCompanies()
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedCompanyId) return
    loadAssignments(selectedCompanyId)
    loadUsers(selectedCompanyId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId])

  const handleCompanyChange = (e) => {
    setSelectedCompanyId(e.target.value)
  }

  const dashboards = useMemo(
    () => assignments?.dashboards || [],
    [assignments]
  )

  const openAssignUsersModal = (dashboard) => {
    setAssigningDashboard(dashboard)
    const alreadyAssignedIds = (dashboard.users || []).map((u) => u.id)
    setSelectedUserIds(alreadyAssignedIds)
    setAssignModalOpen(true)
  }

  const closeAssignModal = () => {
    setAssignModalOpen(false)
    setAssigningDashboard(null)
    setSelectedUserIds([])
  }

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assigningDashboard || !selectedCompanyId) return

    setSaving(true)
    setError(null)

    try {
      await dashboardService.assignDashboardToUsers(
        selectedCompanyId,
        assigningDashboard.id,
        selectedUserIds
      )
      // Recargar asignaciones
      await loadAssignments(selectedCompanyId)
      closeAssignModal()
    } catch (err) {
      console.error('Error al asignar usuarios al dashboard:', err)
      const message =
        err.response?.data?.message || err.message || 'Error al asignar usuarios al dashboard'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="company-assignments-page">
      <div className="page-header">
        <h1>Asignaciones de Dashboards por Compañía</h1>
        <p>Visualiza y gestiona qué usuarios tienen acceso a cada dashboard.</p>
      </div>

      <div className="company-assignments-toolbar">
        <div className="company-filter">
          <label htmlFor="company-select-assignments">Compañía</label>
          <select
            id="company-select-assignments"
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
      </div>

      {error && (
        <div className="error-container" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="company-assignments-card">
        {loading && !assignments ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando asignaciones...</p>
          </div>
        ) : dashboards.length > 0 ? (
          <div className="company-assignments-table-wrapper">
            <table className="company-assignments-table">
              <thead>
                <tr>
                  <th>Dashboard</th>
                  <th>Usuarios Asignados</th>
                  <th style={{ width: '1%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dashboards.map((dashboard) => (
                  <tr key={dashboard.id}>
                    <td>
                      <div className="dashboard-name-cell">
                        <div className="dashboard-title">{dashboard.name}</div>
                        {dashboard.description && (
                          <div className="dashboard-description">{dashboard.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      {dashboard.users && dashboard.users.length > 0 ? (
                        <div className="assigned-users-list">
                          {dashboard.users.map((u) => (
                            <span key={u.id} className="assigned-user-pill">
                              {u.name || u.email}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">Sin usuarios asignados</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => openAssignUsersModal(dashboard)}
                          disabled={users.length === 0}
                        >
                          Asignar usuarios
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
            <p>No hay dashboards asignados para esta compañía todavía.</p>
          </div>
        )}
      </div>

      {/* Modal asignar usuarios */}
      {assignModalOpen && assigningDashboard && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Asignar usuarios a “{assigningDashboard.name}”</h2>
            </div>
            <form onSubmit={handleAssignSubmit} className="modal-form">
              <div className="form-group">
                <label>Usuarios de la compañía</label>
                {users.length === 0 ? (
                  <p className="text-muted">No hay usuarios en esta compañía.</p>
                ) : (
                  <div className="users-checkbox-list">
                    {users.map((u) => (
                      <label key={u.id} className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
                          onChange={() => toggleUserSelection(u.id)}
                        />
                        <span className="checkbox-label">
                          <span className="user-name">{u.name || u.email}</span>
                          {u.email && u.name && (
                            <span className="user-email"> ({u.email})</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeAssignModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving || users.length === 0}>
                  {saving ? 'Guardando...' : 'Guardar asignaciones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyAssignments


