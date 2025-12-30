import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          backgroundColor: "#1f2937",
          color: "white",
        }}
      >
        <h3 style={{ margin: 0 }}>Analysis Report</h3>

        <button
          onClick={() => setShowConfirm(true)}
          style={{
            padding: "8px 14px",
            backgroundColor: "#00b41eff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "8px",
              width: "320px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#111827" }}>
              Confirm Logout
            </h3>
            <p style={{ marginBottom: "20px", color: "#374151" }}>
              Are you sure you want to logout?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 18px",
                  backgroundColor: "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 18px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>


            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
