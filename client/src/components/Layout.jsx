import { NavLink } from "react-router-dom";

function Layout({ title, action, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6">

        <h2 className="text-2xl font-bold mb-10 tracking-tight">
          Signature
        </h2>

        <ul className="space-y-3 text-slate-300">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/10"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/10"
              }`
            }
          >
            Documents
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/10"
              }`
            }
          >
            Settings
          </NavLink>

        </ul>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 md:px-8 bg-white/5 backdrop-blur-xl">
          <h1 className="text-lg md:text-xl font-semibold">
            {title}
          </h1>

          {action && action}
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-8">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Layout;