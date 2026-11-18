
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import api from '../api/axios'

interface CartItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
  imageUrl: string | null
}

interface CartResponse {
  items: CartItem[]
  totalAmount: number
}

interface OrderItem {
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
}

interface OrderResponse {
  orderId: number
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItem[]
}

interface PaymentResponse {
  paymentId: number
  orderId: number
  amount: number
  status: string
  paymentMethod: string
  createdAt: string
}

function CheckoutPage() {
  const navigate = useNavigate()

  const [cart, setCart] = useState<CartResponse>({
    items: [],
    totalAmount: 0,
  })

  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [error, setError] = useState('')
  const [paymentError, setPaymentError] = useState('')

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [payment, setPayment] = useState<PaymentResponse | null>(null)

  const [paymentMethod, setPaymentMethod] = useState('CARD')

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/cart')
        setCart(response.data)
      } catch {
        setError('Failed to load checkout details.')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const processPayment = async (orderId: number) => {
    setPaymentLoading(true)
    setPaymentError('')

    try {
      const response = await api.post('/payments', {
        orderId,
        paymentMethod,
      })

      setPayment(response.data)
    } catch (err) {
      const responseData = (
        err as {
          response?: {
            data?: {
              message?: string
              detail?: string
              title?: string
            }
          }
        }
      ).response?.data

      setPaymentError(
        responseData?.message ||
        responseData?.detail ||
        responseData?.title ||
        'Payment failed. Please try again.'
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    setError('')

    try {
      const response = await api.post('/orders')

      setOrder(response.data)

      await processPayment(response.data.orderId)
    } catch (err) {
      const errorMessage = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message

      setError(errorMessage || 'Failed to place order.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return <p className="p-8 text-center">Loading checkout...</p>
  }

  if (order) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-green-700 text-center">
            {payment ? 'Payment Successful!' : 'Order Created Successfully!'}
          </h1>

          <p className="text-center text-gray-600 mt-4">
            Thank you for shopping with Deshi Bazar.
          </p>

          <div className="border-t mt-6 pt-6 space-y-3">
            <p><strong>Order ID:</strong> {order.orderId}</p>

            <p>
              <strong>Order Status:</strong>{' '}
              {payment ? 'PAID' : order.status}
            </p>

            <p>
              <strong>Total Amount:</strong> ৳ {order.totalAmount.toFixed(2)}
            </p>

            {payment && (
              <>
                <p><strong>Payment ID:</strong> {payment.paymentId}</p>
                <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
                <p><strong>Payment Status:</strong> {payment.status}</p>
              </>
            )}
          </div>

          {paymentError && (
            <div className="mt-5">
              <p className="text-red-600 text-center mb-3 font-semibold">
                {paymentError}
              </p>

              <button
                onClick={() => processPayment(order.orderId)}
                disabled={paymentLoading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
              >
                {paymentLoading ? 'Processing...' : 'Retry Payment'}
              </button>
            </div>
          )}

          <h2 className="text-xl font-bold mt-6 mb-3">Order Items</h2>

          {order.items.map((item, index) => (
            <div key={index} className="border-b py-3">
              <p className="font-semibold">{item.productName}</p>
              <p className="text-gray-600">
                Quantity: {item.quantity} | Subtotal: ৳ {item.subtotal.toFixed(2)}
              </p>
            </div>
          ))}

          <button
            onClick={() => navigate('/my-orders')}
            className="w-full bg-green-700 text-white py-3 rounded-lg mt-6 hover:bg-green-800"
          >
            View My Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Checkout
        </h1>

        {error && (
          <p className="text-red-600 mb-4">{error}</p>
        )}

        {cart.items.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Your cart is empty.</p>

            <button
              onClick={() => navigate('/products')}
              className="bg-green-700 text-white px-5 py-2 rounded-lg mt-4"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b py-4 gap-4"
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

            <div className="flex justify-between mt-6">
              <h2 className="text-xl font-bold">Total Amount</h2>

              <p className="text-2xl font-bold text-green-700">
                ৳ {cart.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="mt-6">
              <label className="block font-semibold text-gray-800 mb-2">
                Select Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >
                <option value="CARD">Card</option>
                <option value="BKASH">bKash</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full bg-green-700 text-white py-3 rounded-lg mt-6 font-semibold hover:bg-green-800 disabled:opacity-50"
            >
              {placingOrder ? 'Processing...' : 'Place Order & Pay'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage
