
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import api from '../api/axios'

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl: string | null
  createdAt: string
}

function ProductsPage() {
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingProductId, setAddingProductId] = useState<number | null>(null)
  const [addedProductId, setAddedProductId] = useState<number | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products')
        setProducts(response.data)
      } catch {
        setError('Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (productId: number) => {
    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      navigate('/login')
      return
    }

    setAddingProductId(productId)
    setAddedProductId(null)
    setError('')

    try {
      await api.post('/cart/items', {
        productId,
        quantity: 1,
      })

      setAddedProductId(productId)
    } catch (err) {
      const errorMessage = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message

      setError(errorMessage || 'Failed to add product to cart.')
    } finally {
      setAddingProductId(null)
    }
  }

  if (loading) {
    return <p className="p-8 text-center">Loading products...</p>
  }

  if (error && products.length === 0) {
    return <p className="p-8 text-center text-red-600">{error}</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Our Products
      </h1>

      <p className="text-gray-600 mb-6">
        Explore our latest products.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {product.imageUrl ? (
              <img
                src={`http://localhost:8080${product.imageUrl}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}

            <div className="p-5">
              <span className="text-sm text-green-700 font-semibold">
                {product.category}
              </span>

              <h2 className="text-xl font-bold text-gray-800 mt-2">
                {product.name}
              </h2>

              <p className="text-gray-600 text-sm mt-2">
                {product.description}
              </p>

              <p className="text-2xl font-bold text-green-700 mt-4">
                ৳ {product.price}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Stock: {product.stock}
              </p>

              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={addingProductId === product.id || product.stock <= 0}
                className="w-full bg-green-700 text-white py-2 rounded-lg mt-4 font-semibold hover:bg-green-800 disabled:opacity-50"
              >
                {addingProductId === product.id
                  ? 'Adding...'
                  : product.stock <= 0
                    ? 'Out of Stock'
                    : 'Add to Cart'}
              </button>

              {addedProductId === product.id && (
                <p className="text-green-700 text-sm text-center mt-3">
                  Product added to cart successfully!
                </p>
              )}

              {error && addingProductId === product.id && (
                <p className="text-red-600 text-sm text-center mt-3">
                  {error}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsPage
