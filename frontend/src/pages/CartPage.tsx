
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
  availableStock: number
}

interface CartResponse {
  items: CartItem[]
  totalAmount: number
}

function CartPage() {
  const navigate = useNavigate()

  const [cart, setCart] = useState<CartResponse>({
    items: [],
    totalAmount: 0,
  })

  const [loading, setLoading] = useState(true)
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null)
  const [removingProductId, setRemovingProductId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [quantityError, setQuantityError] = useState<{
    productId: number
    message: string
  } | null>(null)

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setCart(response.data)
    } catch {
      setError('Failed to load cart.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleQuantityChange = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return

    const selectedItem = cart.items.find(
      (item) => item.productId === productId
    )

    if (selectedItem && newQuantity > selectedItem.availableStock) {
      setQuantityError({
        productId,
        message: 'Stocked Out',
      })
      return
    }

    setUpdatingProductId(productId)
    setQuantityError(null)

    try {
      await api.put(`/cart/items/${productId}`, null, {
        params: { quantity: newQuantity },
      })

      setCart((previousCart) => {
        const updatedItems = previousCart.items.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: item.price * newQuantity,
              }
            : item
        )

        const updatedTotal = updatedItems.reduce(
          (total, item) => total + item.subtotal,
          0
        )

        return {
          items: updatedItems,
          totalAmount: updatedTotal,
        }
      })
    } catch (err) {
      const response = (
        err as {
          response?: {
            status?: number
            data?: {
              message?: string
              detail?: string
              error?: string
              title?: string
            }
          }
        }
      ).response

      if (response?.status === 400) {
        setQuantityError({
          productId,
          message: 'Stocked Out',
        })
      } else {
        setQuantityError({
          productId,
          message:
            response?.data?.message ||
            response?.data?.detail ||
            response?.data?.error ||
            response?.data?.title ||
            'Failed to update quantity.',
        })
      }
    } finally {
      setUpdatingProductId(null)
    }
  }

  const handleRemove = async (productId: number) => {
    setRemovingProductId(productId)
    setError('')
    setQuantityError(null)

    try {
      await api.delete(`/cart/items/${productId}`)
      await fetchCart()
    } catch {
      setError('Failed to remove product from cart.')
    } finally {
      setRemovingProductId(null)
    }
  }

  if (loading) {
    return <p className="p-8 text-center">Loading cart...</p>
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

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          My Shopping Cart
        </h1>

        {error && (
          <p className="text-red-300 bg-red-900/50 p-3 rounded-lg mb-5">
            {error}
          </p>
        )}

        {cart.items.length === 0 ? (

          /* Empty Cart Design */
          <div className="min-h-[65vh] flex items-center justify-center">
            <div className="max-w-2xl w-full text-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-6 py-14 md:py-16">

              <div className="text-7xl mb-6">
                🛒
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                Your Cart is Empty!
              </h2>

              <p className="text-gray-500 mt-5 text-base md:text-lg leading-relaxed max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet.
                Discover fresh groceries and everyday essentials at Deshi Bazar.
              </p>

              <button
                onClick={() => navigate('/products')}
                className="mt-8 bg-green-700 hover:bg-green-800 text-white font-bold px-9 py-3.5 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
              >
                Start Shopping →
              </button>

              <p className="text-sm text-green-700 font-medium mt-6">
                Freshness is just a click away!
              </p>

            </div>
          </div>

        ) : (

          /* Cart Products */
          <div className="max-w-4xl mx-auto">

            <div className="bg-white/95 rounded-xl p-4 mb-5 shadow-lg">
              <p className="text-gray-700 font-semibold">
                You have {cart.items.length} product(s) in your cart.
              </p>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                >
                  {item.imageUrl ? (
                    <img
                      src={`http://localhost:8080${item.imageUrl}`}
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}

                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">
                      {item.productName}
                    </h2>

                    <p className="text-gray-600 mt-1">
                      Price: ৳ {item.price.toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Available Stock: {item.availableStock}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity - 1)
                        }
                        disabled={
                          updatingProductId === item.productId ||
                          item.quantity <= 1
                        }
                        className="bg-gray-200 px-3 py-1 rounded disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity + 1)
                        }
                        disabled={updatingProductId === item.productId}
                        className="bg-gray-200 px-3 py-1 rounded disabled:opacity-40"
                      >
                        +
                      </button>

                      {quantityError?.productId === item.productId && (
                        <span className="text-red-600 text-sm font-semibold">
                          {quantityError.message}
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-green-700 mt-2">
                      Subtotal: ৳ {item.subtotal.toFixed(2)}
                    </p>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removingProductId === item.productId}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg mt-3 hover:bg-red-700 disabled:opacity-50"
                    >
                      {removingProductId === item.productId
                        ? 'Removing...'
                        : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Total Amount
                </h2>

                <p className="text-2xl font-bold text-green-700">
                  ৳ {cart.totalAmount.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-700 text-white py-3 rounded-lg mt-6 font-semibold hover:bg-green-800 transition duration-300"
              >
                Proceed to Checkout
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
