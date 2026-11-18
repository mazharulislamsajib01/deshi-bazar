
import { useEffect, useState } from 'react'
import api from '../api/axios'

interface OrderItem {
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  orderId: number
  customerName: string
  customerEmail: string
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItem[]
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/orders')
      setOrders(response.data)
      setError('')
    } catch {
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, null, {
        params: { status },
      })

      setMessage(`Order #${orderId} status updated to ${status}.`)
      await fetchOrders()
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || 'Failed to update order status.'
      )
    }
  }

  const getNextStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'PAID'
      case 'PAID':
        return 'SHIPPED'
      case 'SHIPPED':
        return 'DELIVERED'
      default:
        return null
    }
  }

  if (loading) {
    return <div className="p-6">Loading orders...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-500">Manage all customer orders</p>
        </div>

        <button
          onClick={fetchOrders}
          className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          No orders found.
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status)

            return (
              <div
                key={order.orderId}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">
                      Order #{order.orderId}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.customerName} ({order.customerEmail})
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">
                      ৳{Number(order.totalAmount).toFixed(2)}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="my-4 border-t" />

                <h3 className="mb-3 font-semibold">Ordered Products</h3>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-wrap justify-between gap-2 text-sm"
                    >
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span>
                        ৳{Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {nextStatus && (
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() =>
                        updateStatus(order.orderId, nextStatus)
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Mark as {nextStatus}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
