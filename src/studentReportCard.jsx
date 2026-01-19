import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { MdEdit, MdDownload, MdArrowBack } from "react-icons/md";
import MainLayout from "./layouts/MainLayout";

const API_BASE = "http://localhost:4000";

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
  const [loading, setLoading] = useState(true);

  const normalizedGraphicData = React.useMemo(() => {
    const map = new Map();
    graphicData.forEach((item) => {
      map.set(item.subject, item);
    });
    return Array.from(map.values());
  }, [graphicData]);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/reports/report-card/data`, {
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
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [term, admission_no]);

  const subjectColors = {
    English: "#6b21a8",
    Maths: "#15803d",
    Science: "#1e40af",
  };

  const CLASS_AVG_COLOR = "#4b5563";

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "#ffffff",
      borderRadius: 12,
    },
    title: {
      text: "Student vs Class Average (%)",
      style: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#111827",
      },
    },
    xAxis: {
      categories: normalizedGraphicData.map((d) => d.subject),
      title: { text: "Subjects" },
      labels: {
        style: {
          fontSize: "14px",
          color: "#374151",
        },
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { 
        text: "Percentage (%)",
        style: {
          fontSize: "14px",
          color: "#374151",
        },
      },
      labels: {
        style: {
          fontSize: "12px",
          color: "#6b7280",
        },
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      itemStyle: {
        fontSize: "14px",
        color: "#374151",
      },
    },
    tooltip: {
      shared: true,
      valueSuffix: "%",
      style: {
        fontSize: "14px",
      },
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        dataLabels: {
          enabled: true,
          format: "{y}%",
          style: {
            fontSize: "12px",
            fontWeight: "600",
          },
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
      await axios.post(`${API_BASE}/reports/term-remark`, {
        admission_no: admission_no,
        term: term,
        year: studentInfo.year,
        remark: termRemark,
        created_by: "teacher_demo",
      });
      
      setIsEditingRemark(false);
      setRemarkUpdatedAt(new Date().toISOString());
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save remark");
    } finally {
      setSavingRemark(false);
    }
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'B+':
      case 'B':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'C':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'D':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'F':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report card...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Remark Saved!</h3>
              <p className="text-gray-600 mb-6">The teacher's remark has been saved successfully.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-6 md:p-8 mb-8">
          <div className="text-center text-white mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Green Valley Public School</h1>
            <p className="text-blue-100">Student Report Card</p>
          </div>
          
          {studentInfo && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-1">Student Name</p>
                  <p className="font-bold text-lg">{studentInfo.student_name}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-1">Admission No</p>
                  <p className="font-bold text-lg">{studentInfo.admission_no}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-1">Academic Year</p>
                  <p className="font-bold text-lg">{studentInfo.year}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-1">Class & Division</p>
                  <p className="font-bold text-lg">Class {studentInfo.class_number} - {studentInfo.batch}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Term Filter and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-medium">Select Term:</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full md:w-auto"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.open(
                `${API_BASE}/reports/report-card/pdf?admission_no=${admission_no}&term=${term}`,
                "_blank"
              )}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg"
            >
              <MdDownload className="mr-2" size={20} />
              Download PDF Report
            </button>
            
            <button
              onClick={() => navigate("/reports/report-card")}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <MdArrowBack className="mr-2" size={20} />
              Back
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Marks Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Subject-wise Performance</h2>
                <p className="text-gray-600 text-sm">Term: {term}</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Max Marks
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Scored
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            No marks data available for this term
                          </div>
                        </td>
                      </tr>
                    ) : (
                      report.map((r, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{r.subject}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{r.max_mark}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{r.scored_mark}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              r.percentage >= 80 ? 'bg-green-100 text-green-800' :
                              r.percentage >= 60 ? 'bg-blue-100 text-blue-800' :
                              r.percentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {r.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${getGradeColor(r.grade)}`}>
                              {r.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{r.remark}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Chart */}
            {normalizedGraphicData.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Right Column - Remarks and Summary */}
          <div className="space-y-8">
            {/* Teacher's Remarks */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Teacher's Remarks</h3>
                  {!isEditingRemark && (
                    <button
                      onClick={() => setIsEditingRemark(true)}
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                    >
                      <MdEdit className="mr-2" size={16} />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {!isEditingRemark ? (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 min-h-[120px]">
                      {termRemark ? (
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {termRemark.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0">{line}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No remarks added yet.</p>
                      )}
                    </div>
                    {remarkUpdatedAt && (
                      <p className="text-sm text-gray-500 mt-3">
                        Last updated: {new Date(remarkUpdatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <textarea
                      value={termRemark}
                      onChange={(e) => setTermRemark(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                      placeholder="Enter your remarks about the student's performance..."
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setIsEditingRemark(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRemark}
                        disabled={savingRemark}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingRemark ? (
                          <>
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                            Saving...
                          </>
                        ) : (
                          'Save Remark'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Summary</h3>
              
              {report.length > 0 && (
                <div className="space-y-4">
                  {/* Overall Percentage */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Overall Percentage</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(
                          report.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / report.length
                        ).toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          style={{
                            width: `${(
                              report.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / report.length
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Subject Count */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-green-800 font-bold text-2xl">{report.length}</div>
                      <div className="text-green-600 text-sm">Total Subjects</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-purple-800 font-bold text-2xl">
                        {report.filter(r => r.grade !== 'F').length}
                      </div>
                      <div className="text-purple-600 text-sm">Passed Subjects</div>
                    </div>
                  </div>

                  {/* Grade Distribution */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Grade Distribution</h4>
                    <div className="space-y-2">
                      {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map((grade) => {
                        const count = report.filter(r => r.grade === grade).length;
                        if (count === 0) return null;
                        
                        return (
                          <div key={grade} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Grade {grade}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    grade.includes('A') ? 'bg-green-500' :
                                    grade.includes('B') ? 'bg-blue-500' :
                                    grade === 'C' ? 'bg-yellow-500' :
                                    grade === 'D' ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${(count / report.length) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}