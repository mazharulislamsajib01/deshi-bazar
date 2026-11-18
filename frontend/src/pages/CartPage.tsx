
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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        My Cart
      </h1>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {cart.items.length === 0 ? (
        <p className="text-gray-600">Your shopping cart is empty.</p>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-5 flex items-center gap-5"
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

          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Total Amount</h2>

              <p className="text-2xl font-bold text-green-700">
                ৳ {cart.totalAmount.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-green-700 text-white py-3 rounded-lg mt-6 font-semibold hover:bg-green-800"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
