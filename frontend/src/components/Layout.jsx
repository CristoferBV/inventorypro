// src/components/Layout.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Drawer,
  Navbar,
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  IconButton,
  Chip,
} from "@material-tailwind/react";

import {
  Squares2X2Icon,      // Dashboard
  TagIcon,             // Categories
  CubeIcon,            // Products
  CircleStackIcon,     // Inventory
  ArrowsRightLeftIcon, // Movements
  ArrowDownTrayIcon,   // Receive
  ArrowUpTrayIcon,     // Issue
  AdjustmentsHorizontalIcon, // Adjust
  Bars3Icon,           // Menu
  XMarkIcon,           // Close
} from "@heroicons/react/24/solid";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NAV_ITEM_BASE =
  "my-1 rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white";
const NAV_ITEM_ACTIVE = "bg-white/10 text-white ring-1 ring-white/10";

// Tamaño consistente para heroicons (usan className, no size)
const iconClass = "h-[18px] w-[18px] opacity-90";

function Brand({ mobile, onClose }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
        <span className="text-sm font-semibold">IP</span>
      </div>

      <div className="leading-tight">
        <Typography variant="h6" className="text-white">
          InventoryPro
        </Typography>
        <Typography variant="small" className="text-white/60">
          Warehouse Console
        </Typography>
      </div>

      {mobile ? (
        <IconButton
          variant="text"
          className="ml-auto text-white"
          onClick={onClose}
          aria-label="Close menu"
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      ) : null}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography
      variant="small"
      className="px-2 pb-2 pt-2 font-semibold uppercase tracking-wider text-white/50"
    >
      {children}
    </Typography>
  );
}

function SidebarContent({ onNavigate }) {
  const nav = useMemo(
    () => [
      { to: "/", label: "Dashboard", icon: Squares2X2Icon, end: true },
      { to: "/categories", label: "Categories", icon: TagIcon },
      { to: "/products", label: "Products", icon: CubeIcon },
      { to: "/inventory", label: "Inventory", icon: CircleStackIcon },
      { to: "/movements", label: "Stock Movements", icon: ArrowsRightLeftIcon },
    ],
    []
  );

  const modules = useMemo(
    () => [
      { to: "/stock/receive", label: "Receive Stock", icon: ArrowDownTrayIcon },
      { to: "/stock/issue", label: "Issue Stock", icon: ArrowUpTrayIcon },
      {
        to: "/stock/adjust",
        label: "Adjust Stock",
        icon: AdjustmentsHorizontalIcon,
      },
    ],
    []
  );

  return (
    <Card className="h-full w-full rounded-none bg-transparent p-2 shadow-none">
      <SectionTitle>Navigation</SectionTitle>

      <List className="p-0">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className="block"
          >
            {({ isActive }) => (
              <ListItem className={cn(NAV_ITEM_BASE, isActive && NAV_ITEM_ACTIVE)}>
                <ListItemPrefix className="mr-3">
                  <Icon className={iconClass} />
                </ListItemPrefix>
                <span className="text-sm font-medium">{label}</span>
              </ListItem>
            )}
          </NavLink>
        ))}
      </List>

      <div className="my-3 border-t border-white/10" />

      <SectionTitle>Modules</SectionTitle>

      <List className="p-0">
        {modules.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className="block">
            {({ isActive }) => (
              <ListItem className={cn(NAV_ITEM_BASE, isActive && NAV_ITEM_ACTIVE)}>
                <ListItemPrefix className="mr-3">
                  <Icon  className={iconClass} />
                </ListItemPrefix>
                <span className="text-sm font-medium">{label}</span>
              </ListItem>
            )}
          </NavLink>
        ))}
      </List>
    </Card>
  );
}

export default function Layout() {
  const location = useLocation();
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      {/* Mobile Drawer */}
      <Drawer
        open={openMobile}
        onClose={() => setOpenMobile(false)}
        className="bg-[#070A12] p-0"
        overlayProps={{ className: "bg-black/70" }}
      >
        <div className="border-b border-white/10">
          <Brand mobile onClose={() => setOpenMobile(false)} />
        </div>
        <div className="h-[calc(100%-72px)] overflow-auto">
          <SidebarContent onNavigate={() => setOpenMobile(false)} />
        </div>
      </Drawer>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden h-screen w-[290px] shrink-0 border-r border-white/10 bg-white/5 md:block">
          <Brand />
          <div className="h-[calc(100%-72px)] overflow-auto px-2 pb-4">
            <SidebarContent />
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <Navbar className="sticky top-0 z-20 rounded-none border-b border-white/10 bg-white/5 px-4 py-3 shadow-none backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconButton
                  variant="text"
                  className="text-white md:hidden"
                  onClick={() => setOpenMobile(true)}
                >
                  <Bars3Icon className="h-5 w-5" />
                </IconButton>

                <div className="leading-tight">
                  <Typography variant="h6" className="text-white">
                    InventoryPro — Import & Distribution Warehouse
                  </Typography>
                  <Typography variant="small" className="text-white/60">
                    Gestión de inventario para bodega/distribución (EE. UU. → CR)
                  </Typography>
                </div>
              </div>

              <Chip
                value="Connected"
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10"
              />
            </div>
          </Navbar>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
