import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
import MainLayout from "../../layouts/MainLayout";

const API_BASE = "http://localhost:4000";

export default function Dashboard() {
  // Data states
  const [performance, setPerformance] = useState([]);
  const [passFail, setPassFail] = useState([]);
  const [subjectAvg, setSubjectAvg] = useState([]);
  const [termComparison, setTermComparison] = useState([]);
  const [reportSubjectAvg, setReportSubjectAvg] = useState([]);
  const [reportTermAvg, setReportTermAvg] = useState([]);
  const [topOverall, setTopOverall] = useState([]);
  const [topSubject, setTopSubject] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Filter states
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ===================== FILTER PARAMS ===================== */
  const params = {
    class_number: selectedClass !== "ALL" ? selectedClass : undefined,
    batch: selectedBatch !== "ALL" ? selectedBatch : undefined,
  };

  /* ===================== FETCH CLASSES ===================== */
  useEffect(() => {
    axios
      .get(`${API_BASE}/filters/classes`)
      .then((res) => setAvailableClasses(res.data.data || []))
      .catch((err) => console.error("Failed to fetch classes:", err));
  }, []);

  /* ===================== FETCH BATCHES ===================== */
  useEffect(() => {
    if (selectedClass === "ALL") {
      setAvailableBatches([]);
      setSelectedBatch("ALL");
      return;
    }

    axios
      .get(`${API_BASE}/filters/batches`, {
        params: { class_number: selectedClass },
      })
      .then((res) => setAvailableBatches(res.data.data || []))
      .catch((err) => console.error("Failed to fetch batches:", err));
  }, [selectedClass]);

  /* ===================== FETCH ALL DATA ===================== */
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [
        perfRes,
        passFailRes,
        subjectAvgRes,
        termCompRes,
        reportSubjRes,
        reportTermRes,
        topOverallRes,
        topSubjRes,
        leaderboardRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/charts/performance-distribution`, { params }),
        axios.get(`${API_BASE}/charts/subject-pass-fail`, { params }),
        axios.get(`${API_BASE}/charts/subject-average`, { params }),
        axios.get(`${API_BASE}/charts/term-comparison`, { params }),
        axios.get(`${API_BASE}/charts/report-subject-avg`, { params }),
        axios.get(`${API_BASE}/charts/report-term-avg`, { params }),
        axios.get(`${API_BASE}/table/top-students-overall`, { params }),
        axios.get(`${API_BASE}/table/top-students-subject`, { params }),
        axios.get(`${API_BASE}/table/leaderboard`, { params }),
      ]);

      setPerformance(perfRes.data.data || []);
      setPassFail(passFailRes.data.data || []);
      setSubjectAvg(subjectAvgRes.data.data || []);
      setTermComparison(termCompRes.data.data || []);
      setReportSubjectAvg(reportSubjRes.data.data || []);
      setReportTermAvg(reportTermRes.data.data || []);
      setTopOverall(topOverallRes.data.data || []);
      setTopSubject(topSubjRes.data.data || []);
      setLeaderboard(leaderboardRes.data.data || []);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedBatch]);

  /* ===================== CHART COLORS ===================== */
  const colors = [
    "#4f46e5",
    "#16a34a",
    "#dc2626",
    "#0ea5e9",
    "#9333ea",
    "#ff8f4fff",
  ];

  /* ===================== SIMPLE BAR CHART ===================== */
  const simpleChart = (labels, data, label, color) => ({
    labels,
    datasets: [{ label, data, backgroundColor: color }],
  });

  /* ===================== GROUPED TERM COMPARISON ===================== */
  const groupedTermChart = useMemo(() => {
    const subjects = [...new Set(termComparison.map((d) => d.subject))];
    const terms = [...new Set(termComparison.map((d) => d.term))];

    const termColors = {
      "Term 1": "#22c55e",
      "Term 2": "#f3c848ff",
    };

    return {
      labels: subjects,
      datasets: terms.map((term) => ({
        label: term,
        backgroundColor: termColors[term] || "#9ca3af",
        data: subjects.map(
          (sub) =>
            termComparison.find((d) => d.subject === sub && d.term === term)
              ?.avg_score || 0
        ),
      })),
    };
  }, [termComparison]);

  /* ===================== GROUPED PASS FAIL ===================== */
  const groupedPassFailChart = useMemo(() => {
    const subjects = [...new Set(passFail.map((d) => d.subject))];
    const types = ["Pass", "Fail"];

    return {
      labels: subjects,
      datasets: types.map((type) => ({
        label: type,
        backgroundColor: type === "Pass" ? "#7c3aed" : "#ef4444",
        data: subjects.map(
          (sub) =>
            passFail.find((d) => d.subject === sub && d.term === type)
              ?.avg_score || 0
        ),
      })),
    };
  }, [passFail]);

  /* ===================== LOADING SKELETON ===================== */
  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <div className="flex gap-4">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  /* ===================== ERROR MESSAGE ===================== */
  const ErrorMessage = () => (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-start gap-5">
      <FiAlertCircle className="text-red-500 text-3xl shrink-0 mt-1" />
      <div className="flex-1">
        <h3 className="text-red-900 font-bold text-2xl mb-3 tracking-tight">
          Error Loading Dashboard
        </h3>
        <p className="text-red-700 mb-5 font-medium">{error}</p>
        <button
          onClick={() => fetchData()}
          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition font-semibold shadow-lg shadow-red-500/30"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  /* ===================== EMPTY STATE ===================== */
  const EmptyState = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <FiAlertCircle className="text-6xl mb-4" />
      <p className="text-lg font-semibold">{title || "No data available"}</p>
    </div>
  );

  /* ===================== MODERN TABLE ===================== */
  const ModernTable = ({ headers, data, renderRow }) => (
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <EmptyState title="No records found" />
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                {renderRow(row)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  /* ===================== MAIN UI ===================== */
  return (
    <MainLayout>
      <div className="p-6 max-w-400 mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
              📊 Student Dashboard
            </h1>
            <p className="text-gray-500 text-base font-medium">
              Real-time analytics and performance insights
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-0"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white font-medium text-gray-700 hover:border-gray-300 transition"
          >
            <option value="ALL">All Classes</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            disabled={selectedClass === "ALL"}
            className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed font-medium text-gray-700 hover:border-gray-300 transition"
          >
            <option value="ALL">All Batches</option>
            {availableBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Error State */}
        {error && !loading && <ErrorMessage />}

        {/* Main Content */}
        {!loading && !error && (
          <div className="space-y-8">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Performance Distribution */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Performance Distribution
                </h4>
                {performance.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Bar
                    data={simpleChart(
                      performance.map((d) => d.subject),
                      performance.map((d) => d.avg_score),
                      "Average Score",
                      colors[5]
                    )}
                    options={{ maintainAspectRatio: true, responsive: true }}
                  />
                )}
              </div>

              {/* Pass vs Fail */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Pass vs Fail
                </h4>
                {passFail.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Bar
                    data={groupedPassFailChart}
                    options={{ maintainAspectRatio: true, responsive: true }}
                  />
                )}
              </div>

              {/* Top Students Overall */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Top Students (Overall)
                </h4>
                <ModernTable
                  headers={["Rank", "Name", "Average %"]}
                  data={topOverall}
                  renderRow={(s) => (
                    <>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {s.student_name}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-indigo-600">
                        {s.avg_marks}%
                      </td>
                    </>
                  )}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Subject Average */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Subject Average
                </h4>
                {subjectAvg.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Bar
                    data={simpleChart(
                      subjectAvg.map((d) => d.subject),
                      subjectAvg.map((d) => d.avg_score),
                      "Average %",
                      colors[0]
                    )}
                    options={{ maintainAspectRatio: true, responsive: true }}
                  />
                )}
              </div>

              {/* Term Comparison */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Term Comparison
                </h4>
                {termComparison.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Bar
                    data={groupedTermChart}
                    options={{ maintainAspectRatio: true, responsive: true }}
                  />
                )}
              </div>

              {/* Leaderboard */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Leaderboard
                </h4>
                <ModernTable
                  headers={["Rank", "Name", "Class", "Division", "%"]}
                  data={leaderboard}
                  renderRow={(s) => (
                    <>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {s.student_name}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {s.class_number}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {s.batch}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-green-600">
                        {s.percentage}%
                      </td>
                    </>
                  )}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Report Subject Average */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Report Subject Average
                </h4>
                {reportSubjectAvg.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Bar
                    data={simpleChart(
                      reportSubjectAvg.map((d) => d.subject),
                      reportSubjectAvg.map((d) => d.avg_score),
                      "Average %",
                      colors[3]
                    )}
                    options={{ maintainAspectRatio: true, responsive: true }}
                  />
                )}
              </div>

              {/* Report Term Average */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Report Term Average
                </h4>
                {reportTermAvg.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Bar
                    data={simpleChart(
                      reportTermAvg.map((d) => d.term),
                      reportTermAvg.map((d) => d.avg_score),
                      "Average %",
                      colors[4]
                    )}
                    options={{ maintainAspectRatio: true, responsive: true }}
                  />
                )}
              </div>

              {/* Top Students by Subject */}
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
                  Top Students (Subject)
                </h4>
                <ModernTable
                  headers={[
                    "Rank",
                    "Subject",
                    "Name",
                    "Total",
                    "Avg",
                    "Class",
                    "Batch",
                  ]}
                  data={topSubject}
                  renderRow={(s) => (
                    <>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {s.subject}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {s.student_name}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {s.total_marks}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-purple-600">
                        {s.avg_score}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {s.class_number}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600">
                        {s.batch}
                      </td>
                    </>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
