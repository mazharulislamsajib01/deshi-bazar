
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'

function getUserRole() {
  try {
    const token = localStorage.getItem('accessToken')

    if (!token) return null

    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    return payload.role || null
  } catch {
    return null
  }
}

function Navbar() {
  const navigate = useNavigate()

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem('accessToken')
  )

  const [userRole, setUserRole] = useState(getUserRole)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  const isAdmin = isLoggedIn && userRole === 'ADMIN'

  useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'))
      setUserRole(getUserRole())
      setShowAccountMenu(false)
    }

    window.addEventListener('auth-change', updateLoginStatus)

    return () => {
      window.removeEventListener('auth-change', updateLoginStatus)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenType')

    window.dispatchEvent(new Event('auth-change'))

    setShowAccountMenu(false)
    navigate('/')
  }

  return (
    <nav className="bg-green-700 text-white px-8 py-4 flex items-center justify-between">
      <Link
        to={isAdmin ? '/admin/dashboard' : '/'}
        className="text-2xl font-bold"
      >
        Deshi Bazar
      </Link>

      <div className="flex items-center gap-6">

        {!isAdmin && (
          <>
            <Link to="/" className="hover:text-yellow-300">
              Home
            </Link>

            <Link to="/products" className="hover:text-yellow-300">
              Products
            </Link>

            {isLoggedIn && (
              <>
                <Link to="/cart" className="hover:text-yellow-300">
                  Cart
                </Link>

                <Link to="/my-orders" className="hover:text-yellow-300">
                  My Orders
                </Link>
              </>
            )}
          </>
        )}

        {!isLoggedIn ? (
          <>
            <Link to="/login" className="hover:text-yellow-300">
              Login
            </Link>

            <Link to="/register" className="hover:text-yellow-300">
              Register
            </Link>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="hover:text-yellow-300 font-semibold"
            >
              Account ▾
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-3 w-44 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 font-semibold border-b">
                  My Account
                </div>

                {!isAdmin && (
                  <Link
                    to="/my-orders"
                    onClick={() => setShowAccountMenu(false)}
                    className="block px-4 py-3 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
