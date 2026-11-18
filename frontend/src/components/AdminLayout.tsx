
import { Outlet } from 'react-router'
import AdminSidebar from './AdminSidebar'

function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
