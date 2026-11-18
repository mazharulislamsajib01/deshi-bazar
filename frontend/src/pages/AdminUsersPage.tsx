
import { useEffect, useState } from 'react'
import api from '../api/axios'

interface User {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER'
  createdAt: string
}

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data)
      setError('')
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())

    const matchesRole =
      roleFilter === 'ALL' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const roleStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700'
      case 'SELLER':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  if (loading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-gray-500">
            Manage and view registered users
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {/* User Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="mt-2 text-2xl font-bold">{users.length}</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Customers</p>
          <h2 className="mt-2 text-2xl font-bold">
            {users.filter((u) => u.role === 'CUSTOMER').length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Sellers</p>
          <h2 className="mt-2 text-2xl font-bold">
            {users.filter((u) => u.role === 'SELLER').length}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border px-4 py-2"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="SELLER">Seller</option>
          <option value="CUSTOMER">Customer</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Joined Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-4">{user.id}</td>
                  <td className="px-5 py-4 font-medium">{user.name}</td>
                  <td className="px-5 py-4">{user.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${roleStyle(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </p>
    </div>
  )
}

export default AdminUsersPage
