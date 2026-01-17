
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login.jsx";
import Register from "./pages/auth/register.jsx";
import StudentSummary from "./pages/students/StudentTable.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Attendance from "./attendance/Attendance.jsx"
import StudentListPage from "./pages/students/studentMarkEntrypage.jsx";
import ExamMarkEntriesPage from "./pages/students/examMarkEntriesPage.jsx";
import UserCreate from "./UserRegistration/UserCreate.jsx";
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
       <Route path="/students" element={<StudentSummary />} /> 
        <Route path="/attendance" element={<Attendance />}/>
        <Route path="/exam-mark-entries" element={< ExamMarkEntriesPage/>} />
        <Route path="/studentss" element={<StudentListPage />} />
        <Route path="/user-create" element={<UserCreate/>} />
      </Routes>
    </Router>
  );
}
 