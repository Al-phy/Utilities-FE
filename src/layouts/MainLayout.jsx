import { NavLink } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/NavBar.jsx";
import {
  FiMenu,
  FiBarChart2,
  FiUsers,
  FiClipboard
} from "react-icons/fi";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <span className="logo">SCHOOL MANAGEMENT SYSTEM</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-link">
            <FiBarChart2 />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/studentss" className="nav-link">
            <FiUsers />
            <span>Students Mark Entry</span>
          </NavLink>

          <NavLink to="/exam-mark-entries" className="nav-link">
            <FiClipboard />
            <span>Exam Marks view/edit</span>
          </NavLink>
          <NavLink to="/attendance"className="nav-link">
           <FiClipboard />
           <span>Attendance</span>
           </NavLink>
           <NavLink to="/user-create"className="nav-link">
           <FiUsers/>
           <span>User Registration</span>
           </NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="main">
        <Navbar
          onToggle={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
        />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
