
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
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

function OrderDetailsPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`)
        setOrder(response.data)
      } catch {
        setError('Failed to load order details.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  if (loading) {
    return <p className="p-8 text-center">Loading order details...</p>
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center">
        <p className="text-red-600">
          {error || 'Order not found.'}
        </p>

        <button
          onClick={() => navigate('/my-orders')}
          className="bg-green-700 text-white px-5 py-2 rounded-lg mt-4"
        >
          Back to My Orders
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Order Details
        </h1>

        <div className="space-y-3 border-b pb-5">
          <p>
            <strong>Order ID:</strong> #{order.orderId}
          </p>

          <p>
            <strong>Order Date:</strong>{' '}
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <p>
            <strong>Status:</strong> {order.status}
          </p>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-4">
          Ordered Products
        </h2>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={`${item.productId}-${index}`}
              className="flex justify-between gap-4 border-b pb-4"
            >
              <div>
                <p className="font-semibold">{item.productName}</p>

                <p className="text-sm text-gray-600">
                  ৳ {item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>

              <p className="font-semibold">
                ৳ {item.subtotal.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t pt-5 mt-5">
          <h2 className="text-xl font-bold">Total Amount</h2>

          <p className="text-2xl font-bold text-green-700">
            ৳ {order.totalAmount.toFixed(2)}
          </p>
        </div>

        <button
          onClick={() => navigate('/my-orders')}
          className="w-full bg-green-700 text-white py-3 rounded-lg mt-6 font-semibold hover:bg-green-800"
        >
          Back to My Orders
        </button>
      </div>
    </div>
  )
}

export default OrderDetailsPage
