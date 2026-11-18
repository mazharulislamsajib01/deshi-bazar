
import { useEffect, useState, type FormEvent } from 'react'
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

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState<File | null>(null)

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

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setStock('')
    setCategory('')
    setImage(null)
    setEditingProductId(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id)
    setName(product.name)
    setDescription(product.description || '')
    setPrice(String(product.price))
    setStock(String(product.stock))
    setCategory(product.category)
    setImage(null)

    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const productData = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
      }

      let productId: number

      if (editingProductId !== null) {
        await api.put(`/products/${editingProductId}`, productData)
        productId = editingProductId
      } else {
        const response = await api.post('/products', productData)
        productId = response.data.id
      }

      if (image) {
        const formData = new FormData()
        formData.append('file', image)

        await api.post(
          `/products/${productId}/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      }

      setSuccess(
        editingProductId !== null
          ? 'Product updated successfully!'
          : 'Product added successfully!'
      )

      resetForm()
      setShowForm(false)
      await fetchProducts()

    } catch {
      setError(
        editingProductId !== null
          ? 'Failed to update product. Please try again.'
          : 'Failed to add product. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmed) return

    setDeletingId(productId)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/products/${productId}`)

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== productId)
      )

      setSuccess('Product deleted successfully.')
    } catch {
      setError('Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 md:p-8">

      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Products
          </h1>

          <p className="text-gray-600 mt-2">
            View and manage all products.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm()
              setShowForm(false)
            } else {
              resetForm()
              setShowForm(true)
            }

            setError('')
            setSuccess('')
          }}
          className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {editingProductId !== null
              ? 'Edit Product'
              : 'Add New Product'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border rounded-lg p-3"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border rounded-lg p-3"
                placeholder="Example: Electronics"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Price (৳)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="0.01"
                required
                className="w-full border rounded-lg p-3"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                step="1"
                required
                className="w-full border rounded-lg p-3"
                placeholder="Enter stock quantity"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full border rounded-lg p-3"
                placeholder="Enter product description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                Product Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files?.[0] || null)
                }
                className="w-full border rounded-lg p-3"
              />
              {editingProductId !== null && (
                <p className="text-sm text-gray-500 mt-2">
                  Select a new image only if you want to replace the current one.
                </p>
              )}
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : editingProductId !== null
                ? 'Update Product'
                : 'Save Product'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center p-8">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="bg-white p-6 rounded-xl text-gray-600">
          No products found.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="p-4">
                    <div className="flex items-center gap-3 min-w-48">
                      {product.imageUrl ? (
                        <img
                          src={`http://localhost:8080${product.imageUrl}`}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                      )}

                      <span className="font-semibold text-gray-800">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">{product.category}</td>
                  <td className="p-4">৳ {product.price.toFixed(2)}</td>
                  <td className="p-4">{product.stock}</td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
