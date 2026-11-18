
import { useEffect, useState } from 'react'
import api from '../api/axios'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  imageUrl: string | null
}

function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [quantity, setQuantity] = useState('')
  const [saving, setSaving] = useState(false)

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

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleStockUpdate = async (type: 'stock-in' | 'stock-out') => {
    if (!selectedProduct || !quantity || Number(quantity) <= 0) {
      setError('Please select a product and enter a valid quantity.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await api.post(`/inventory/${selectedProduct}/${type}`, {
        quantity: Number(quantity),
      })

      setSuccess(
        type === 'stock-in'
          ? 'Stock added successfully!'
          : 'Stock removed successfully!'
      )

      setQuantity('')
      setSelectedProduct(null)

      await fetchProducts()
    } catch (err) {
      const errorMessage = (
        err as { response?: { data?: { message?: string } } }
      ).response?.data?.message

      setError(errorMessage || 'Failed to update stock.')
    } finally {
      setSaving(false)
    }
  }

  const lowStockProducts = products.filter(
    (product) => product.stock <= 5
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor product stock and manage inventory.
        </p>
      </div>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-5">
          {error}
        </p>
      )}

      {success && (
        <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-5">
          {success}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Products</p>
          <h2 className="text-3xl font-bold mt-2">{products.length}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Stock Units</p>
          <h2 className="text-3xl font-bold mt-2">
            {products.reduce((total, product) => total + product.stock, 0)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Low Stock Products</p>
          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {lowStockProducts.length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Update Stock
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Product
            </label>

            <select
              value={selectedProduct ?? ''}
              onChange={(e) =>
                setSelectedProduct(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full border rounded-lg p-3"
            >
              <option value="">Choose a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => handleStockUpdate('stock-in')}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Processing...' : '+ Stock In'}
          </button>

          <button
            onClick={() => handleStockUpdate('stock-out')}
            disabled={saving}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? 'Processing...' : '- Stock Out'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <h2 className="text-xl font-bold text-gray-800 p-6">
          Current Inventory
        </h2>

        {loading ? (
          <p className="p-6">Loading inventory...</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="p-4 font-semibold">
                    {product.name}
                  </td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4">৳ {product.price.toFixed(2)}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">
                    {product.stock === 0 ? (
                      <span className="text-red-600 font-semibold">
                        Out of Stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="text-orange-600 font-semibold">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminInventoryPage
