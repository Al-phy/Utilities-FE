import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "./layouts/MainLayout";

const API_BASE = "http://localhost:4000";

const ReportCardGenerator = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch available classes
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch batches when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchBatches(selectedClass);
    } else {
      setBatches([]);
      setSelectedBatch("");
    }
  }, [selectedClass]);

  // Fetch students when both class and batch are selected
  useEffect(() => {
    if (selectedClass && selectedBatch) {
      fetchStudents(selectedClass, selectedBatch);
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedBatch]);

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE}/reports/classes`);
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Fetch batches for a class
  const fetchBatches = async (classNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE}/reports/classes/${classNumber}/batches`
      );
      setBatches(response.data.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchStudents = async (classNumber, batch) => {
    try {
      const response = await axios.get(
        `${API_BASE}/reports/students-by-class-batch`,
        {
          params: {
            class: classNumber,
            batch: batch,
          },
        }
      );
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleViewReportCard = (admissionNo) => {
    window.open(`/reports/report-card/${admissionNo}`, "_blank");
  };

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Report Card 
          </h1>
          <p className="text-gray-600 mt-2">
            Generate and view student report cards
          </p>
        </div>

        {/* Selection Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                disabled={loading}
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id || cls} value={cls.number || cls}>
                    Class {cls.number || cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Division/Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                disabled={!selectedClass || batches.length === 0}
              >
                <option value="">-- Select Division --</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    Division {batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedClass("");
                  setSelectedBatch("");
                }}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>

        {/* Students List Card */}
        {selectedClass && selectedBatch && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Students - Class {selectedClass}, Division {selectedBatch}
                </h2>
                <span className="text-sm text-gray-500">
                  {students.length} students found
                </span>
              </div>
            </div>

            {loadingStudents ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.5a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">
                  No students found for the selected class and division
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admission No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr
                        key={student.admission_no}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.admission_no}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.student_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll No: {student.roll_number || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              handleViewReportCard(student.admission_no)
                            }
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Report Card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!selectedClass && !selectedBatch && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-medium text-gray-900">
                  How to Generate Report Cards
                </h3>
                <ul className="mt-3 space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">1.</span>
                    Select a class from the dropdown above
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">2.</span>
                    Select a division/batch for that class
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">3.</span>
                    The student list will appear automatically
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">4.</span>
                    Click "View Report Card" next to any student to see their
                    report
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  );
};

export default ReportCardGenerator;
