
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import StudentSummary from "./StudentTable.jsx";
import Dashboard from "./Dashboard.jsx";
import Attendance from "./attendance/Attendance.jsx"
import StudentListPage from "./studentMarkEntrypage.jsx";
import ExamMarkEntriesPage from "./examMarkEntriesPage.jsx";
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
 
  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      {isLogin ? <Login /> : <Register />}
 
      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{
          padding: "12px 20px",
          backgroundColor: "#1a9364ff",
          color: "white",
          border: "none",
          fontSize: "18px",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        {isLogin ? "Go to Register" : "Go to Login"}
      </button>
    </div>
  );
}
 
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<ExamMarkEntriesPage />} />
        <Route path="/attendance" element={<Attendance />}/>
        <Route path="/exam-mark-entries" element={< StudentListPage/>} />
      </Routes>
    </Router>
  );
}
 