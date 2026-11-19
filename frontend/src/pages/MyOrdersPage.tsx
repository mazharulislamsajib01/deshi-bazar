
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
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=85')",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Page Content */}
      <div className="relative z-10 min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            My Orders
          </h1>

          {message && (
            <p className="bg-green-100 text-green-800 p-4 rounded-lg mb-5 font-medium">
              {message}
            </p>
          )}

          {error && (
            <p className="bg-red-100 text-red-700 p-4 rounded-lg mb-5">
              {error}
            </p>
          )}

          {orders.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm p-10 md:p-14 rounded-2xl shadow-xl text-center mt-12">

              <div className="text-6xl mb-6">
                📦
              </div>

              <h2 className="text-3xl font-bold text-gray-800">
                No Orders Yet!
              </h2>

              <p className="text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">
                You haven't placed any orders yet.
                Explore our fresh groceries and everyday essentials
                and place your first order today!
              </p>

              <button
                onClick={() => navigate('/products')}
                className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold mt-8 hover:bg-green-800 transition duration-300"
              >
                Start Shopping →
              </button>

            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition duration-300"
                >
                  <div className="flex flex-wrap justify-between gap-4 border-b pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
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
                          <p className="font-semibold text-gray-800">
                            {item.productName}
                          </p>

                          <p className="text-sm text-gray-500">
                            ৳ {item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold text-gray-800">
                          ৳ {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        Total Amount
                      </h3>

                      <p className="text-xl font-bold text-green-700">
                        ৳ {order.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate(`/my-orders/${order.orderId}`)}
                        className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
                      >
                        View Details
                      </button>

                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          disabled={cancellingOrderId === order.orderId}
                          className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
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
    </div>
  )
}

export default MyOrdersPage
