// MainLayout.jsx
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  let heading = "";

  if (location.pathname === "/reports") {
    heading = "Student Performance Dashboard";
  }

  if (location.pathname === "/students") {
    const mode =
      location.state?.mode ||
      location.state?.viewMode ||
      "create";

    if (mode === "view") heading = "Students Mark - View Only";
    else if (mode === "edit") heading = "Students Mark - Edit Mode";
    else heading = "Students Mark - Create";
  }

  if (location.pathname === "/exam-mark-entries") {
    heading = "Exam Mark Entries";
  }

  function handleLogout() {
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1c2d] flex flex-col">
        <div className="px-6 py-5 text-xl font-bold text-white border-b border-white/10">
          SCHOOL APP
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { to: "/reports", label: "Reports" },
            { to: "/students", label: "Students" },
            { to: "/exam-mark-entries", label: "Exam Mark Entries" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm font-medium rounded-md transition
                ${
                  isActive
                    ? "bg-[#102a43] text-white"
                    : "text-gray-200 hover:bg-[#081626]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP HEADER */}
        <header className="h-16 bg-white flex items-center justify-between px-7 border-b border-gray-200 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">
            {heading}
          </h1>

          {/* LOGOUT (UNCHANGED) */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg transition
            hover:-translate-y-1 hover:scale-105 hover:bg-red-700 font-bold"
          >
            Logout
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
