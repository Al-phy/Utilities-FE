import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
const API = "http://localhost:4000";

export default function Attendance() {
  const navigate = useNavigate();

  const [classNum, setClassNum] = useState("");
  const [batch, setBatch] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDateAlert, setShowDateAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hideSuccess, setHideSuccess] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [sessionId, setSessionId] = useState(null);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [updateSuccess, setUpdateSuccess] = useState(false);
const [hideUpdateSuccess, setHideUpdateSuccess] = useState(false);


  useEffect(() => {
    if (classNum && batch) {
      axios
        .get(`${API}/students`, {
          params: { class_number: classNum, batch },
        })
        .then((res) => {
          const list = res.data.data.map((s) => ({
            ...s,
            status: "Present",
          }));
          setStudents(list);
        });
    } else {
      setStudents([]);
    }
  }, [classNum, batch]);
  useEffect(() => {
    axios.get(`${API}/filters/classes`).then(res => {
      setClasses(res.data.data || []);
    });
  }, []);
  useEffect(() => {
    if (!classNum) {
      setBatches([]);
      setBatch("");
      return;
    }

    axios
      .get(`${API}/filters/batches`, {
        params: { class_number: classNum },
      })
      .then(res => {
        setBatches(res.data.data || []);
        setBatch(""); // reset batch
      });
  }, [classNum]);
  useEffect(() => {
  if (!classNum || !batch || !date) return;

  axios
    .get(`${API}/attendance/by-date`, {
      params: { class_number: classNum, batch, date },
    })
    .then(async (res) => {
      if (res.data.success) {
        // ✅ EXISTING ATTENDANCE → load records
        setStudents(
          res.data.records.map(r => ({
            admission_no: r.admission_no,
            student_name: r.student_name,
            status: r.status,
          }))
        );
        setSessionId(res.data.sessionId);
        setIsExisting(true);
      } else {
        // ✅ NO ATTENDANCE → load students list
        const studentRes = await axios.get(`${API}/students`, {
          params: { class_number: classNum, batch },
        });

        setStudents(
          studentRes.data.data.map(s => ({
            admission_no: s.admission_no,
            student_name: s.student_name,
            status: "Present",
          }))
        );

        setSessionId(null);
        setIsExisting(false);
      }
    });
}, [date, classNum, batch]);

 const updateAttendance = async () => {
  try {
    setSaving(true);
    await axios.put(`${API}/attendance/update/${sessionId}`, {
      records: students,
    });

    // ✅ Show update success popup
    setUpdateSuccess(true);
    setHideUpdateSuccess(false);

    setTimeout(() => setHideUpdateSuccess(true), 800);
    setTimeout(() => setUpdateSuccess(false), 1200);
  } catch (err) {
    console.error(err);
    alert("Server error while updating attendance");
  } finally {
    setSaving(false);
  }
};

  const deleteAttendance = async () => {
    if (!window.confirm("Delete attendance for this date?")) return;

    await axios.delete(`${API}/attendance/delete/${sessionId}`);

    setStudents([]);
    setDate("");
    setIsExisting(false);
  };


  const handleStatusChange = (index, value) => {
    const updated = [...students];
    updated[index].status = value;
    setStudents(updated);
  };

  const saveAttendance = () => {
    if (!date) {
      setShowDateAlert(true);
      return;
    }
    setShowConfirm(true);
  };


  const confirmSaveAttendance = async () => {
  try {
    setSaving(true);

    const res = await axios.post(`${API}/attendance/save`, {
      class_number: classNum,
      batch,
      date,
      createdBy: localStorage.getItem("username"),
      records: students.map(s => ({
        admission_no: s.admission_no,
        student_name: s.student_name,
        status: s.status,
      })),
    });
      if (!res.data.success) {
        alert(res.data.message || "Save failed");
        return;
      }
      setSessionId(res.data.sessionId);   // ✅ IMPORTANT
      setIsExisting(true);   
      setShowConfirm(false);
      setShowSuccess(true);
      setHideSuccess(false);

      setTimeout(() => setHideSuccess(true), 800);
      setTimeout(() => setShowSuccess(false), 1200);
      console.log(students)
    } catch (err) {
      console.error(err);
      alert("Server error while saving attendance");
    } finally {
      setSaving(false);
    }
  };


  return (
    <MainLayout>
    <div style={styles.page}>
      {/*CONFIRMATION POPUP FOR SAVE */}
      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Confirm Attendance</h3>
            <p style={styles.modalText}>
              Are you sure you want to save attendance for this date?
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                style={styles.confirmBtn}
                onClick={confirmSaveAttendance}
                disabled={saving}
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/*  POPUP FOR DATE */}
      {showDateAlert && (
        <div style={styles.modalOverlay}>
          <div style={styles.alertCard}>
            <h3 style={styles.alertTitle}>Date Required</h3>
            <p style={styles.alertText}>
              Please select a date before saving attendance.
            </p>

            <div style={{ textAlign: "right" }}>
              <button
                style={styles.confirmBtn}
                onClick={() => setShowDateAlert(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* succcessv popup*/}
      {showSuccess && (
        <div style={styles.modelOverlay}>
          <div
            style={{
              ...styles.successCard,
              ...(hideSuccess ? styles.successExit : {}),
            }}
          >
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>Attendance Saved</h3>
            <p style={styles.successText}>
              Attendance has been saved successfully.
            </p>
          </div>
        </div>
      )}

{updateSuccess && (
  <div style={styles.modelOverlay}>
    <div
      style={{
        ...styles.successCard,
        ...(hideUpdateSuccess ? styles.successExit : {}),
      }}
    >
      <div style={styles.successIcon}>✓</div>
      <h3 style={styles.successTitle}>Attendance Updated</h3>
      <p style={styles.successText}>
        Attendance updated successfully.
      </p>
    </div>
  </div>
)}
{showDeleteConfirm && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>
      <h3 style={styles.modalTitle}>Confirm Delete</h3>
      <p style={styles.modalText}>
        Are you sure you want to delete attendance for this date?
      </p>

      <div style={styles.modalActions}>
        <button
          style={styles.cancelBtn}
          onClick={() => setShowDeleteConfirm(false)}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          style={styles.confirmBtn}
          onClick={async () => {
            try {
              setSaving(true);
              await axios.delete(`${API}/attendance/delete/${sessionId}`);
              setStudents([]);
              setDate("");
              setIsExisting(false);
              setShowDeleteConfirm(false);
            } catch (err) {
              console.error(err);
              alert("Server error while deleting attendance");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          {saving ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}


      {/* 🔙 BACK BUTTON */}
      <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
        ⬅
      </button>

      {/* 📋 MAIN CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>📋 Attendance Management</h2>

        {/* 🔽 FILTERS CARD */}
        <div style={styles.filterCard}>
          <select
            value={classNum}
            onChange={(e) => setClassNum(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>


          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            style={styles.input}
            disabled={!classNum}
          >
            <option value="">Select Batch</option>
            {batches.map(b => (
              <option key={b} value={b}>
                Batch {b}
              </option>
            ))}
          </select>


          <input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}  // ✅ disables future dates
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
          />

        </div>


        {/* 📊 TABLE CARD */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>Student List</div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableCell}>Admission No</th>
                  <th style={styles.tableCell}>Student Name</th>
                  <th style={{ ...styles.tableCell, textAlign: "center" }}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={styles.noData}>
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((s, i) => (
                    <tr
                     key={`${s.admission_no}-${i}`}
                      style={{
                        ...styles.row,
                        background: i % 2 === 0 ? "#f9fafb" : "white",
                      }}
                    >
                      <td style={styles.tableCell}>{s.admission_no}</td>
                      <td style={styles.tableCell}>{s.student_name}</td>
                      <td style={{ ...styles.tableCell, textAlign: "center" }}>
                        <div
                          style={styles.toggleWrapper}
                          onClick={() =>
                            handleStatusChange(
                              i,
                              s.status === "Present" ? "Absent" : "Present"
                            )
                          }
                        >
                          <div
                            style={{
                              ...styles.toggleTrack,
                              backgroundColor:
                                s.status === "Present" ? "#5b21b6" : "#e5e7eb",
                            }}
                          >
                            <div
                              style={{
                                ...styles.toggleKnob,
                                transform:
                                  s.status === "Present"
                                    ? "translateX(26px)"
                                    : "translateX(0px)",
                                backgroundColor:
                                  s.status === "Present" ? "#ffffff" : "#ffffff",
                              }}
                            />
                          </div>

                          <span
                            style={{
                              ...styles.toggleLabel,
                              color: s.status === "Present" ? "#17773cff" : "#771717ff",
                            }}
                          >
                            {s.status}
                          </span>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 💾 SAVE BUTTON */}
        <div style={{ textAlign: "center", marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
          {!isExisting && (
            <button style={styles.saveBtn} onClick={saveAttendance}>
              ✅ Save Attendance
            </button>
          )}

          {isExisting && (
            <>
              <button
                style={{ ...styles.saveBtn, backgroundColor: "#7b00b4ff" }}
                onClick={updateAttendance}
              >
                ✏️ Update Attendance
              </button>
<button
  style={{ ...styles.saveBtn, backgroundColor: "#b91c1c" }}
  onClick={() => setShowDeleteConfirm(true)}
>
  🗑️ Delete Attendance
</button>

            </>
          )}
        </div>

      </div>
    </div >
    </MainLayout>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: 30,
  },

  backBtn: {
    marginBottom: 20,
    padding: "8px 14px",
    backgroundColor: "#A47DAB",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  card: {
    maxWidth: 950,
    margin: "auto",
    background: "white",
    padding: 30,
    borderRadius: 14,
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
  },

  title: {
    marginBottom: 25,
    color: "#641f77ff",
    fontSize: 22,
  },

  /* ================= FILTER CARD ================= */
  filterCard: {
    display: "flex",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 25,
    padding: 20,
    backgroundColor: "#7b00b4ff",
    borderRadius: 12,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    alignItems: "center",
  },

  input: {
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    minWidth: 120,
    cursor: "pointer",
  },

  /* ================= TABLE CARD ================= */
  tableCard: {
    borderRadius: 12,
    overflow: "hidden",
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    marginBottom: 25,
  },

  tableHeader: {
    padding: "16px 24px",
    background: "#7b00b4ff",
    color: "white",
    fontWeight: 600,
    fontSize: 16,
  },

  tableContainer: {
    overflowX: "auto",
    padding: "16px 24px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  tableCell: {
    padding: "12px 16px",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 15,
    color: "#641f77ff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  row: {
    transition: "background 0.2s",
  },

  toggleWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
  },

  toggleTrack: {
    width: 50,
    height: 24,
    borderRadius: 999,
    position: "relative",
    transition: "background-color 0.25s ease",
  },

  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    position: "absolute",
    top: 2,
    left: 2,
    transition: "transform 0.25s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
  },

  toggleLabel: {
    fontSize: 14,
    fontWeight: 600,
    minWidth: 60,
    textAlign: "left",
  },

  noData: {
    textAlign: "center",
    padding: 30,
    color: "#6b7280",
  },

  saveBtn: {
    padding: "10px 20px",
    backgroundColor: "#5B455E",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  modalCard: {
    width: 360,
    background: "white",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 25px 40px rgba(0,0,0,0.25)",
    animation: "scaleIn 0.25s ease",
  },

  modalTitle: {
    marginBottom: 10,
    color: "#7b00b4ff",
    fontSize: 20,
    fontWeight: 600,
  },

  modalText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 22,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelBtn: {
    padding: "8px 16px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },

  confirmBtn: {
    padding: "8px 16px",
    background: "#7b00b4ff",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  alertCard: {
    width: 320,
    background: "white",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 25px 40px rgba(0,0,0,0.25)",
  },

  alertTitle: {
    color: "#7b00b4ff",
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
  },

  alertText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 18,
  },
  /* ===== SUCCESS POPUP ===== */

  modelOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  successCard: {
    width: 340,
    background: "white",
    borderRadius: 16,
    padding: "26px 24px",
    textAlign: "center",
    boxShadow: "0 30px 50px rgba(0,0,0,0.3)",
    animation: "popIn 0.3s ease-out",
  },

  successExit: {
    opacity: 0,
    transform: "scale(0.9)",
    transition: "all 0.4s ease-in-out",
  },

  successIcon: {
    width: 56,
    height: 56,
    margin: "0 auto 12px",
    borderRadius: "50%",
    background: "#7b00b4ff",
    color: "white",
    fontSize: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  successTitle: {
    color: "#7b00b4ff",
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 6,
  },

  successText: {
    fontSize: 14,
    color: "#4b5563",
  },

};
