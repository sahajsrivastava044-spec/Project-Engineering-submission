import { Link, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext)

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <Link
          to="/"
          className="flex items-center space-x-2 text-brand-600 font-bold text-xl"
        >
          <Shield className="w-6 h-6" />
          <span>VaultApp</span>
        </Link>

        <div className="flex items-center space-x-6 text-sm font-medium">

          <Link
            to="/dashboard"
            className="text-slate-600 hover:text-brand-600 transition-colors"
          >
            Dashboard
          </Link>

          <Link
            to="/settings"
            className="text-slate-600 hover:text-brand-600 transition-colors"
          >
            Settings
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">

              <span className="text-slate-700">
                Welcome, {user?.name || user?.email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all font-semibold"
              >
                Logout
              </button>

            </div>
          ) : (
            <Link
              to="/login"
              className="bg-brand-50 text-brand-600 px-4 py-2 rounded-lg hover:bg-brand-100 transition-all font-semibold"
            >
              Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  )
}

export default Navbar