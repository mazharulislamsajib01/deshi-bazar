
import { useState } from 'react'
import type { FormEvent } from 'react'
import api from '../api/axios'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      })

      setMessage('Registration successful! You can now login.')
      setName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      const errorMessage = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message

      setError(errorMessage || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Email
            </label>
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
            <label className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
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

export default RegisterPage
