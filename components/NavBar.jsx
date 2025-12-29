import { useNavigate } from "react-router-dom";
 
function Navbar() {
  const navigate = useNavigate();
 
  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    navigate("/");
  }
 
  return (
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
        onClick={handleLogout}
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
  );
}
 
export default Navbar;
 