import { useEffect, useState } from "react";
import { getCategories } from "./services/categories";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(data => setCategories(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold">InventoryPro Admin</h1>
      <p className="mt-2 text-gray-600">Categories</p>

      {loading && <p className="mt-4">Loading...</p>}

      <ul className="mt-4 space-y-2">
        {categories.map(cat => (
          <li
            key={cat.id}
            className="rounded border bg-white px-4 py-2 shadow-sm"
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
