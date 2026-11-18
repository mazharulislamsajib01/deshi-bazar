
import { NavLink } from 'react-router'

function AdminSidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Inventory', path: '/admin/inventory' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
  ]

  return (
    <aside className="w-full md:w-64 bg-gray-900 text-white min-h-full p-5">
      <h2 className="text-2xl font-bold text-green-400 mb-8">
        Admin Panel
      </h2>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
