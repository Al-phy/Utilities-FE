import React, { useState } from "react";
import StudentForm from "./StudentForm";
import TeacherForm from "./TeacherForm";
import "./userCreate.css";
import MainLayout from "../layouts/MainLayout";

export default function UserCreate() {
  const [role, setRole] = useState("");

  const getTitle = () => {
    if (role === "student") return "Student Registration";
    if (role === "teacher") return "Teacher Registration";
    return "User Registration";
  };

  const getSubtitle = () => {
    if (role === "student") return "Register a new student";
    if (role === "teacher") return "Register a new teacher";
    return "Create student or teacher account";
  };

  return (
    <MainLayout>
    <div className="page-wrapper">
      <h1 className="page-title">{getTitle()}</h1>
      <p className="page-subtitle">{getSubtitle()}</p>

      <div style={{ maxWidth: "300px" }}>
        <div className="form-group">
          <label>Select Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
      </div>

      <div className="divider" />

      {role === "student" && <StudentForm />}
      {role === "teacher" && <TeacherForm />}
    </div>
    </MainLayout>
  );
}
