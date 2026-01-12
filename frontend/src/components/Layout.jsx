// src/components/Layout.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Tags,
  Package,
  Boxes,
  ArrowLeftRight,
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
  Menu,
  X,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NAV_LINK_BASE =
  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
const NAV_LINK_INACTIVE = "text-slate-300 hover:bg-white/5 hover:text-white";
const NAV_LINK_ACTIVE = "bg-white/10 text-white ring-1 ring-white/10";

export default function Layout() {
  const location = useLocation();
  const [openMobile, setOpenMobile] = useState(false);

  // Cierra el drawer en mobile al navegar
  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname]);

  const nav = useMemo(
    () => [
      { to: "/categories", label: "Categories", icon: Tags },
      { to: "/products", label: "Products", icon: Package },
      { to: "/inventory", label: "Inventory", icon: Boxes },
      { to: "/movements", label: "Stock Movements", icon: ArrowLeftRight },
    ],
    []
  );

  const modules = useMemo(
    () => [
      { to: "/stock/receive", label: "Receive Stock", icon: PackagePlus },
      { to: "/stock/issue", label: "Issue Stock", icon: PackageMinus },
      { to: "/stock/adjust", label: "Adjust Stock", icon: SlidersHorizontal },
    ],
    []
  );

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={cn(
        "h-full w-72 shrink-0",
        "bg-slate-900/60 backdrop-blur",
        "border-r border-white/10",
        "flex flex-col"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/25">
          <span className="text-indigo-200 font-bold">IP</span>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">InventoryPro</div>
          <div className="text-xs text-slate-400">Admin panel</div>
        </div>

        {mobile && (
          <button
            className="ml-auto rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-white"
            onClick={() => setOpenMobile(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-4 pb-4">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        <ul className="space-y-1.5">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(NAV_LINK_BASE, isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE)
              }
            >
              <LayoutDashboard
                size={18}
                className="text-slate-300 group-hover:text-white"
              />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {nav.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    NAV_LINK_BASE,
                    isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE
                  )
                }
              >
                <Icon
                  size={18}
                  className="text-slate-300 group-hover:text-white"
                />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="my-5 border-t border-white/10" />

        <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Modules
        </div>

        <ul className="space-y-1.5">
          {modules.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    NAV_LINK_BASE,
                    isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE
                  )
                }
              >
                <Icon
                  size={18}
                  className="text-slate-300 group-hover:text-white"
                />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 py-4">
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="text-xs text-slate-300">
            Backend: <span className="text-white/90">.NET API</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            https://localhost:7257
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ✅ Full width layout (ya NO hay mx-auto ni max-w en el wrapper) */}
      <div className="flex min-h-screen w-full">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile topbar */}
          <div className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 hover:bg-white/10"
                onClick={() => setOpenMobile(true)}
              >
                <Menu size={18} />
                Menu
              </button>

              <div className="text-sm font-semibold">InventoryPro</div>

              <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-[11px] font-semibold text-indigo-200 ring-1 ring-indigo-500/25">
                Connected
              </span>
            </div>
          </div>

          {/* Mobile drawer */}
          {openMobile && (
            <div className="lg:hidden">
              <div
                className="fixed inset-0 z-40 bg-black/60"
                onClick={() => setOpenMobile(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-xs">
                <Sidebar mobile />
              </div>
            </div>
          )}

          {/* Content */}
          <main className="flex-1 p-6 lg:p-10">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  InventoryPro Admin
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  React + Tailwind + .NET — inventory, products and stock control
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
                  API: https://localhost:7257
                </span>
              </div>
            </div>

            {/* ✅ Page container (opcionalmente limitamos SOLO el contenido) */}
            <div className="w-full">
              <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
