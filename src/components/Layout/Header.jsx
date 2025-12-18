import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="header-title">Bienvenido, {user?.name || 'Usuario'}</h2>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header


