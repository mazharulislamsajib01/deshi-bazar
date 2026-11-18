
import { Routes, Route } from 'react-router'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import MyOrdersPage from './pages/MyOrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'

import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminInventoryPage from './pages/AdminInventoryPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminUsersPage from './pages/AdminUsersPage'

import AdminLayout from './components/AdminLayout'
import Navbar from './components/Navbar'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/my-orders/:orderId" element={<OrderDetailsPage />} />

        {/* Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
