import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import "./Navbar.css";

export default function Navbar({ onToggle }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    navigate("/");
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        {/* MENU BUTTON */}
        <button className="menu-btn" onClick={onToggle}>
          <FiMenu size={22} />
        </button>

        {/* TITLE */}
        <h3 className="navbar-title">📊 Student Analytics</h3>

        {/* ACTIONS */}
        <div className="navbar-actions">
          <button
            className="nav-btn"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white"
            }}
            onClick={() => setShowConfirm(true)}
          >
            Logout
          </button>
        </div>
      </header>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
