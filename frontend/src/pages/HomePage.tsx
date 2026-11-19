
function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero Banner */}
      <section
        className="relative min-h-[550px] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=85')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Banner Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12">
          <div className="max-w-2xl text-white">

            <p className="text-green-300 font-semibold uppercase tracking-widest mb-4">
              Welcome to Deshi Bazar
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Freshness Delivered to Your Doorstep
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mt-6">
              Shop fresh groceries, vegetables, fruits and daily essentials
              at the best prices.
            </p>

            <a
              href="/products"
              className="inline-block mt-8 bg-green-600 hover:bg-green-700
              text-white font-semibold px-8 py-3 rounded-lg transition duration-300"
            >
              Explore Products
            </a>

          </div>
        </div>
      </section>

    </div>
  )
}

export default HomePage
