import { useState, useEffect } from "react";

const CLASSES = ["Class 7", "Class 8", "Class 9", "Class 10"];
const BATCHES = ["A", "B", "C"];

export default function StudentForm() {
  const [userCode, setUserCode] = useState("");

  useEffect(() => {
    const code = "STU-" + Math.floor(10000 + Math.random() * 90000);
    setUserCode(code);
  }, []);

  return (
    <form>
      <div className="form-grid">
        <div className="input-group">
          <label>User Code</label>
          <input type="text" value={userCode} readOnly />
        </div>

        <div className="input-group">
          <label>Full Name</label>
          <input type="text" />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email" />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" />
        </div>

        <div className="input-group">
          <label>Class</label>
          <select>
            <option value="">Select Class</option>
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Batch</label>
          <select>
            <option value="">Select Batch</option>
            {BATCHES.map((batch) => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Parent Name</label>
          <input type="text" />
        </div>

        <div className="input-group">
          <label>Parent Email</label>
          <input type="email" />
        </div>
      </div>

      <button type="submit">Create Student</button>
    </form>
  );
}
