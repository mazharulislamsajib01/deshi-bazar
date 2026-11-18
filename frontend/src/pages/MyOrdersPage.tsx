
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
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
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItem[]
}

function MyOrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders')
        setOrders(response.data)
      } catch {
        setError('Failed to load order history.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleCancelOrder = async (orderId: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${orderId}?`
    )

    if (!confirmed) return

    setCancellingOrderId(orderId)
    setError('')
    setMessage('')

    try {
      const response = await api.put(`/orders/${orderId}/cancel`)

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.orderId === orderId ? response.data : order
        )
      )

      setMessage(`Order #${orderId} cancelled successfully.`)
    } catch (err) {
      const errorMessage = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message

      setError(errorMessage || 'Failed to cancel order.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  if (loading) {
    return <p className="p-8 text-center">Loading orders...</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          My Orders
        </h1>

        {message && (
          <p className="text-green-700 mb-4">{message}</p>
        )}

        {error && (
          <p className="text-red-600 mb-4">{error}</p>
        )}

        {orders.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">
              You haven't placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex flex-wrap justify-between gap-4 border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold">
                      Order #{order.orderId}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {order.status}
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {item.productName}
                        </p>

                        <p className="text-sm text-gray-500">
                          ৳ {item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold">
                        ৳ {item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold">Total Amount</h3>

                    <p className="text-xl font-bold text-green-700">
                      ৳ {order.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/my-orders/${order.orderId}`)}
                      className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-800"
                    >
                      View Details
                    </button>

                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        disabled={cancellingOrderId === order.orderId}
                        className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                      >
                        {cancellingOrderId === order.orderId
                          ? 'Cancelling...'
                          : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrdersPage
