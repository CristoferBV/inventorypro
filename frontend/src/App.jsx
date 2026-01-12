import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import MovementsPage from "./pages/MovementsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/categories" replace />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/movements" element={<MovementsPage />} />
        <Route path="*" element={<Navigate to="/categories" replace />} />
      </Route>
    </Routes>
  );
}
