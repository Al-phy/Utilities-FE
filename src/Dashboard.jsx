import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/NavBar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API_BASE = "http://localhost:4000";

/* ===================== STYLES ===================== */
const styles = {
  page: { padding: "20px", maxWidth: "1400px", margin: "0 auto" },
  filters: { display: "flex", gap: "16px", marginBottom: "20px" },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.2fr",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: "#fff",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};

/* ===================== COMPONENT ===================== */
export default function Dashboard() {
  const [performance, setPerformance] = useState([]);
  const [passFail, setPassFail] = useState([]);
  const [subjectAvg, setSubjectAvg] = useState([]);
  const [termComparison, setTermComparison] = useState([]);
  const [reportSubjectAvg, setReportSubjectAvg] = useState([]);
  const [reportTermAvg, setReportTermAvg] = useState([]);

  const [topOverall, setTopOverall] = useState([]);
  const [topSubject, setTopSubject] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState("ALL");

  const params = {
    class_number: selectedClass !== "ALL" ? selectedClass : undefined,
    batch: selectedBatch !== "ALL" ? selectedBatch : undefined,
  };

  /* ===================== FETCH DATA ===================== */
  useEffect(() => {
    axios.get(`${API_BASE}/charts/performance-distribution`, { params }).then(r => setPerformance(r.data.data));
    axios.get(`${API_BASE}/charts/subject-pass-fail`, { params }).then(r => setPassFail(r.data.data));
    axios.get(`${API_BASE}/charts/subject-average`, { params }).then(r => setSubjectAvg(r.data.data));
    axios.get(`${API_BASE}/charts/term-comparison`, { params }).then(r => setTermComparison(r.data.data));
    axios.get(`${API_BASE}/charts/report-subject-avg`, { params }).then(r => setReportSubjectAvg(r.data.data));
    axios.get(`${API_BASE}/charts/report-term-avg`, { params }).then(r => setReportTermAvg(r.data.data));

    axios.get(`${API_BASE}/table/top-students-overall`, { params }).then(r => setTopOverall(r.data.data));
    axios.get(`${API_BASE}/table/top-students-subject`, { params }).then(r => setTopSubject(r.data.data));
    axios.get(`${API_BASE}/table/leaderboard`, { params }).then(r => setLeaderboard(r.data.data));
  }, [selectedClass, selectedBatch]);

  /* ===================== CHART HELPER ===================== */
  const makeChart = (labels, data, label) => ({
    labels,
    datasets: [{ label, data, backgroundColor: "#4f46e5" }],
  });

  /* ===================== UI ===================== */
  return (
    <>
      <Navbar showLinks={false} />
      <div style={styles.page}>
        <h2>📊 Student Dashboard</h2>

        {/* Filters */}
        <div style={styles.filters}>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="ALL">All Classes</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>

          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            <option value="ALL">All Batches</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>

        {/* ROW 1 */}
        <div style={styles.row}>
          <div style={styles.card}>
            <h4>Performance Distribution</h4>
            <Bar data={makeChart(
              performance.map(d => d.subject),
              performance.map(d => d.avg_score),
              "Students"
            )} />
          </div>

          <div style={styles.card}>
            <h4>Pass vs Fail</h4>
            <Bar data={makeChart(
              passFail.map(d => `${d.subject}-${d.term}`),
              passFail.map(d => d.avg_score),
              "Count"
            )} />
          </div>

          <div style={styles.card}>
            <h4>Top Students (Overall)</h4>
            <table width="100%" border="1">
              <thead>
                <tr><th>Rank</th><th>Name</th><th>Avg %</th></tr>
              </thead>
              <tbody>
                {topOverall.map(s => (
                  <tr key={s.admission_no}>
                    <td>{s.rank}</td>
                    <td>{s.student_name}</td>
                    <td>{s.avg_marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 2 */}
        <div style={styles.row}>
          <div style={styles.card}>
            <h4>Subject Average</h4>
            <Bar data={makeChart(
              subjectAvg.map(d => d.subject),
              subjectAvg.map(d => d.avg_score),
              "Avg %"
            )} />
          </div>

          <div style={styles.card}>
            <h4>Term Comparison</h4>
            <Bar data={makeChart(
              termComparison.map(d => `${d.subject}-${d.term}`),
              termComparison.map(d => d.avg_score),
              "Avg %"
            )} />
          </div>

          <div style={styles.card}>
            <h4>Top Students (Subject)</h4>
            <table width="100%" border="1">
              <thead>
                <tr><th>Rank</th><th>Subject</th><th>Name</th><th>%</th></tr>
              </thead>
              <tbody>
                {topSubject.map(s => (
                  <tr key={s.rank}>
                    <td>{s.rank}</td>
                    <td>{s.subject}</td>
                    <td>{s.student_name}</td>
                    <td>{s.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 3 */}
        <div style={styles.row}>
          <div style={styles.card}>
            <h4>Report Subject Average</h4>
            <Bar data={makeChart(
              reportSubjectAvg.map(d => d.subject),
              reportSubjectAvg.map(d => d.avg_score),
              "Avg %"
            )} />
          </div>

          <div style={styles.card}>
            <h4>Report Term Average</h4>
            <Bar data={makeChart(
              reportTermAvg.map(d => d.term),
              reportTermAvg.map(d => d.avg_score),
              "Avg %"
            )} />
          </div>

          <div style={styles.card}>
            <h4>Leaderboard</h4>
            <table width="100%" border="1">
              <thead>
                <tr><th>Rank</th><th>Name</th><th>%</th></tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 5).map(s => (
                  <tr key={s.rank}>
                    <td>{s.rank}</td>
                    <td>{s.student_name}</td>
                    <td>{s.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
