import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './Profile.css'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Aquí se implementará la actualización del perfil
    console.log('Actualizando perfil:', formData)
    setIsEditing(false)
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal</p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'Usuario'}</h2>
            <p>{user?.email || ''}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Empresa</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Cambios
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile


