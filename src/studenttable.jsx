import { useEffect, useState } from "react";
 
function StudentSummary() {
  const [selection, setSelection] = useState("1A");
  const [rows, setRows] = useState([]);
 
  useEffect(() => {
    const classNumber = selection.charAt(0);
    const batch = selection.charAt(1);
 
    fetch(
      `http://localhost:4000/students/summary?class=${classNumber}&batch=${batch}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRows(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, [selection]);
 
  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Subject Summary</h2>
 
      {/* Dropdown */}
      <select
        value={selection}
        onChange={(e) => setSelection(e.target.value)}
      >
        <option value="1A">1A</option>
        <option value="1B">1B</option>
        <option value="2A">2A</option>
        <option value="2B">2B</option>
      </select>
 
      {/* Table */}
      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>No. of Students</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="2">No data</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                <td>{row.subject}</td>
                <td>{row.number_of_students}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
 
export default StudentSummary;
 
 