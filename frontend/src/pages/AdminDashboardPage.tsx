
import { useEffect, useState } from 'react'
import api from '../api/axios'

interface RecentOrder {
  orderId: number
  customerName: string
  totalAmount: number
  status: string
}

interface DashboardData {
  totalUsers: number
  totalCustomers: number
  totalSellers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  recentOrders: RecentOrder[]
}

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard')
        setDashboard(response.data)
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return <p className="p-8 text-center">Loading dashboard...</p>
  }

  if (error || !dashboard) {
    return <p className="p-8 text-center text-red-600">{error}</p>
  }

  const statistics = [
    { title: 'Total Users', value: dashboard.totalUsers },
    { title: 'Customers', value: dashboard.totalCustomers },
    { title: 'Sellers', value: dashboard.totalSellers },
    { title: 'Products', value: dashboard.totalProducts },
    { title: 'Orders', value: dashboard.totalOrders },
    {
      title: 'Total Revenue',
      value: `৳ ${dashboard.totalRevenue.toLocaleString('en-BD')}`,
    },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Admin Dashboard
      </h1>

      <p className="text-gray-600 mt-2 mb-8">
        Welcome to Deshi Bazar administration panel.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {statistics.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl shadow p-6"
          >
            <p className="text-gray-500 font-medium">
              {item.title}
            </p>

            <h2 className="text-3xl font-bold text-green-700 mt-3">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow mt-8 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Recent Orders
        </h2>

        {dashboard.recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b">
                    <td className="py-3 px-2">#{order.orderId}</td>
                    <td className="py-3 px-2">{order.customerName}</td>
                    <td className="py-3 px-2">
                      ৳ {order.totalAmount.toLocaleString('en-BD')}
                    </td>
                    <td className="py-3 px-2">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
