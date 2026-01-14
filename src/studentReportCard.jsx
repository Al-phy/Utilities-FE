import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsReactImport from "highcharts-react-official";
import { MdEdit } from "react-icons/md";

const API_BASE = "http://localhost:5000";

export default function StudentReportCard() {
  const { admission_no } = useParams();
  const navigate = useNavigate();

  const [term, setTerm] = useState("Term 1");
  const [report, setReport] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [graphicData, setGraphicData] = useState([]);
  const [termRemark, setTermRemark] = useState("");
  const [isEditingRemark, setIsEditingRemark] = useState(false);
  const [savingRemark, setSavingRemark] = useState(false);
  const [remarkUpdatedAt, setRemarkUpdatedAt] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const normalizedGraphicData = React.useMemo(() => {
    const map = new Map();
    graphicData.forEach((item) => {
      map.set(item.subject, item); // last one wins
    });
    return Array.from(map.values());
  }, [graphicData]);

  const HighchartsReact =
    typeof HighchartsReactImport === "function"
      ? HighchartsReactImport
      : HighchartsReactImport.default;

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.get(`${API_BASE}/students/report-card`, {
          params: { admission_no, term },
        });

        const data = res.data.data || [];
        setReport(data);
        setGraphicData(res.data.graphic_data || []);
        setTermRemark(res.data.term_remark || "");
        setRemarkUpdatedAt(res.data.remark_updated_at || null);

        setStudentInfo(res.data.student);
      } catch (err) {
        console.error(err);
      }
    }

    fetchReport();
  }, [term, admission_no]);

  // console.log("HighchartsReact:", HighchartsReact);
  const subjectColors = {
    English: "#6b21a8", // purple
    Maths: "#15803d", // dark green
    Science: "#1e40af", // blue
  };

  const CLASS_AVG_COLOR = "#4b5563"; // SAME color for class average bars

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "#ffffff",
    },
    title: {
      text: "Student vs Class Average (%)",
    },
    xAxis: {
      categories: normalizedGraphicData.map((d) => d.subject),
      title: { text: "Subjects" },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: "Percentage (%)" },
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      valueSuffix: "%",
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        dataLabels: {
          enabled: true,
          format: "{y}%",
        },
      },
    },
    series: [
      {
        name: "Student",
        data: normalizedGraphicData.map((d) => ({
          y: d.student_percentage,
          color: subjectColors[d.subject] || "#000000",
        })),
      },

      {
        name: "Class Average",
        data: normalizedGraphicData.map((d) => ({
          y: d.class_average,
          color: CLASS_AVG_COLOR,
        })),
      },
    ],
  };

  async function handleSaveRemark() {
    if (!studentInfo) return;

    try {
      setSavingRemark(true);

      await axios.post(`${API_BASE}/students/term-remark`, {
        admission_no: admission_no,
        term: term,
        year: studentInfo.year,
        remark: termRemark,
        created_by: "teacher_demo", // later replace with logged-in user
      });
      // ✅ switch back to read mode
      setIsEditingRemark(false);

      // ✅ update last-updated locally
      setRemarkUpdatedAt(new Date().toISOString());

      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save remark");
    } finally {
      setSavingRemark(false);
    }
  }

  return (
    <>
      {/* <Navbar /> */}

      <div style={styles.page}>
        {/* ================= HEADER ================= */}
        <div style={styles.headerCard}>
          <h1 style={styles.schoolName}>🌟 Green Valley Public School</h1>
          <p style={styles.subtitle}>Student Report Card</p>

          {studentInfo && (
            <div style={styles.studentInfoRow}>
              <div>
                <b>Student Name:</b> {studentInfo.student_name}
              </div>
              <div>
                <b>Admission No:</b> {studentInfo.admission_no}
              </div>
              <div>
                <b>Term:</b> {studentInfo.term}
              </div>
              <div>
                <b>Academic Year:</b> {studentInfo.year}
              </div>
            </div>
          )}
        </div>

        {/* ================= TERM FILTER ================= */}
        <div style={styles.filterRow}>
          <label style={styles.filterLabel}>Select Term :</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            style={styles.select}
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
          </select>
        </div>

        {/* ================= TABLE ================= */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Max Marks</th>
                <th style={styles.th}>Scored</th>
                <th style={styles.th}>Percentage</th>
                <th style={styles.th}>Grade</th>
                <th style={styles.th}>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {report.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyCell}>
                    No data available
                  </td>
                </tr>
              ) : (
                report.map((r, index) => (
                  <tr key={index}>
                    <td style={{ ...styles.td, ...styles.subject }}>
                      {r.subject}
                    </td>
                    <td style={styles.td}>{r.max_mark}</td>
                    <td style={styles.td}>{r.scored_mark}</td>
                    <td style={styles.td}>{r.percentage}%</td>
                    <td style={{ ...styles.td, ...styles.grade(r.grade) }}>
                      {r.grade}
                    </td>
                    <td style={styles.td}>{r.remark}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PDF DOWNLOAD ================= */}
        <div style={styles.pdfRow}>
          <button
            style={styles.pdfBtn}
            onClick={() =>
              window.open(
                `${API_BASE}/students/report-card/pdf?admission_no=${admission_no}&term=${term}`,
                "_blank"
              )
            }
          >
            📄 Download Report Card (PDF)
          </button>
        </div>

        {/* ================= PERFORMANCE CHART ================= */}
        {normalizedGraphicData.length > 0 && (
          <div style={styles.chartCard}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </div>
        )}

        {/* ================= TEACHER REMARK ================= */}
        <div style={styles.remarkCard}>
          {/* Header */}
          <div style={styles.remarkHeader}>
            <h3 style={styles.remarkTitle}>Teacher’s Remark</h3>

            {!isEditingRemark && (
              <button
                style={styles.editRemarkBtn}
                onClick={() => setIsEditingRemark(true)}
              >
                <MdEdit size={16} style={{ marginRight: "6px" }} />
                Edit
              </button>
            )}
          </div>

          {/* READ MODE */}
          {!isEditingRemark && (
            <>
              <div style={styles.remarkText}>
                {termRemark
                  ? termRemark.split("\n").map((line, i) => (
                      <p key={i} style={{ margin: "0 0 6px 0" }}>
                        {line}
                      </p>
                    ))
                  : "No remark added yet."}
              </div>

              {/* <div style={styles.remarkFooter}>
                Last updated:{" "}
                {remarkUpdatedAt
                  ? new Date(remarkUpdatedAt).toLocaleDateString()
                  : "—"}
              </div> */}
            </>
          )}

          {/* EDIT MODE */}
          {isEditingRemark && (
            <>
              <textarea
                value={termRemark}
                onChange={(e) => setTermRemark(e.target.value)}
                rows={4}
                style={styles.remarkTextarea}
              />

              <div style={styles.remarkActions}>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setIsEditingRemark(false)}
                >
                  Cancel
                </button>

                <button
                  style={styles.saveRemarkBtn}
                  onClick={handleSaveRemark}
                  disabled={savingRemark}
                >
                  {savingRemark ? "Saving..." : "Save"}
                </button>
              </div>
            </>
          )}
        </div>

        {showSuccessModal && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmBox}>
              <p>✅ Remarks Saved Successfully!</p>
              <button
                style={styles.confirmBtn}
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* ================= ACTION ================= */}
        <div style={styles.actionRow}>
          <button style={styles.backBtn} onClick={() => navigate("/students")}>
            Back to Student List
          </button>
        </div>
      </div>
    </>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  page: {
    padding: "32px",
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
  },

  headerCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "28px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  },

  schoolName: {
    margin: 0,
    textAlign: "center",
    color: "#111827",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: "6px",
    marginBottom: "18px",
    fontSize: "15px",
  },

  studentInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    fontSize: "15px",
    color: "#374151",
  },

  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  filterLabel: {
    fontWeight: "600",
    color: "#374151",
  },

  select: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    cursor: "pointer",
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  th: {
    padding: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "center",
    color: "#374151",
  },

  td: {
    padding: "12px",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    fontSize: "14px",
    color: "#111827",
  },

  subject: {
    textAlign: "left",
    fontWeight: "500",
  },

  emptyCell: {
    padding: "20px",
    textAlign: "center",
    color: "#6b7280",
  },

  grade: (grade) => ({
    fontWeight: "700",
    color:
      grade === "A"
        ? "#16a34a"
        : grade === "B"
        ? "#2563eb"
        : grade === "C"
        ? "#ca8a04"
        : "#dc2626",
  }),

  pdfRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "16px",
  },

  pdfBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1e40af)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.35)",
    transition: "all 0.25s ease",
  },

  chartCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "28px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  },

  actionRow: {
    textAlign: "center",
    marginTop: "28px",
  },

  backBtn: {
    padding: "10px 22px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  remarkCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "28px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  },

  remarkTitle: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },

  remarkTextarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontFamily: "inherit",
  },

  saveRemarkBtn: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
  },

  remarkHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  remarkText: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "14px",
    color: "#374151",
    whiteSpace: "pre-wrap",
    minHeight: "70px",
  },

  remarkFooter: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#6b7280",
  },

  editRemarkBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#374151",
  },

  remarkActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "12px",
  },

  cancelBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
  },

  confirmOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  confirmBox: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "280px",
    textAlign: "center",
    fontSize: "15px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
  },

  confirmBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0844c8ff",
    color: "#ffffff",
    cursor: "pointer",
    marginTop: "10px",
  },
};
