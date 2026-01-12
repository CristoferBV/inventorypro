export default function App() {
  const categories = ["Bebidas", "comidas"]; // ejemplo; aquí usarías tu state real

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold">InventoryPro Admin</h1>
        <p className="mt-1 text-sm text-gray-600">
          Panel de administración (React + Tailwind + .NET)
        </p>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Categories</h2>
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              New
            </button>
          </div>

          <ul className="space-y-2">
            {categories.map((c) => (
              <li
                key={c}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <span className="font-medium">{c}</span>
                <div className="flex gap-2">
                  <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-100">
                    Edit
                  </button>
                  <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
