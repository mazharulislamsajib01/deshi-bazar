
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import api from '../api/axios'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      const accessToken = response.data.accessToken

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('tokenType', response.data.tokenType)

      // Decode JWT payload to get user role
      const payload = JSON.parse(
        atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      )

      const role = payload.role

      window.dispatchEvent(new Event('auth-change'))

      setMessage('Login successful!')

      if (role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (role === 'SELLER') {
        navigate('/seller/dashboard')
      } else {
        navigate('/')
      }

    } catch (err) {
      const errorMessage = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message

      setError(errorMessage || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Welcome Back
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {message && (
            <p className="text-green-600 text-center">{message}</p>
          )}

          {error && (
            <p className="text-red-600 text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default LoginPage
