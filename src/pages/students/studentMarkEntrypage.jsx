import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api";
import MainLayout from "../../layouts/MainLayout";
import maleAvatar from "../../assets/dummymale.png";
import femaleAvatar from "../../assets/dummyfemale.png";
import { 
  PlusCircle, 
  Save, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  Filter,
  UserPlus,
  AlertTriangle
} from "lucide-react";

export default function StudentListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= MODE ================= */
  const [mode, setMode] = useState("create");
  const [entryId, setEntryId] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    admission_no: "",
    name: "",
    gender: "M",
    class: "",
    division: "",
    academic_year: "2024-25",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState(""); // "create" | "edit"

  /* ================= DATA ================= */
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [warning, setWarning] = useState("");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  const subjects = ["English", "Maths", "Science"];
  const terms = ["Term 1", "Term 2", "Term 3"];

  const [subject, setSubject] = useState(subjects[0]);
  const [term, setTerm] = useState(terms[0]);

  const [marks, setMarks] = useState({});
  const [absentMap, setAbsentMap] = useState({});

  const [maxMark, setMaxMark] = useState("");
  const [examName, setExamName] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [schoolName, setSchoolName] = useState("My School");

  /* ================= LOAD FILTERS ================= */
  useEffect(() => {
    API.get("/students/filters").then(res => {
      setClasses(res.data.classes || []);
      setSelectedClass(res.data.classes?.[0] || "");
    });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    API.get("/students/divisions", { params: { class: selectedClass } })
      .then(res => {
        setDivisions(res.data || []);
        setSelectedDivision(res.data?.[0] || "");
      });
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass || !selectedDivision) return;
    API.get("/students/students", {
      params: { class: selectedClass, division: selectedDivision },
    }).then(res => {
      setStudents(res.data || []);
      setErrors({});
    });
  }, [selectedClass, selectedDivision]);

  /* ================= LOAD MARKS FOR EDIT ================= */
  useEffect(() => {
    if (!entryId || students.length === 0) return;

    API.get(`/students/exams/marks/${entryId}`, {
      params: { term },
    }).then(res => {
      const m = {};
      const a = {};

      res.data.marks.forEach(row => {
        m[row.admission_no] = row.scored_mark ?? "";
        a[row.admission_no] = row.is_absent === "ABSENT";
      });

      setMarks(m);
      setAbsentMap(a);
    });
  }, [entryId, students, term]);

  /* ================= VIEW / EDIT ================= */
  useEffect(() => {
    if (!location.state?.entryId) return;

    setMode(location.state.mode);
    setEntryId(location.state.entryId);

    API.get(`/students/exams/entries/${location.state.entryId}`)
      .then(res => {
        setSelectedClass(res.data.class);
        setSelectedDivision(res.data.division);
        setSubject(res.data.subject);
        setTerm(res.data.term);
        setExamName(res.data.exam_name);
        setMaxMark(res.data.max_mark);
        setAcademicYear(res.data.academic_year);
        setSchoolName(res.data.school_name);
      });
  }, [location.state]);

  function toggleAbsent(adm) {
    if (mode === "view") return;
    setAbsentMap(p => ({ ...p, [adm]: !p[adm] }));
  }

  async function handleSubmit() {
    const newErrors = {};

    students.forEach(s => {
      const value = marks[s.admission_no];
      if (!absentMap[s.admission_no] && (value === "" || value === undefined)) {
        newErrors[s.admission_no] = "Please Enter Marks";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload = {
      class: selectedClass,
      division: selectedDivision,
      subject,
      term,
      exam_name: examName,
      max_mark: Number(maxMark),
      academic_year: academicYear,
      school_name: schoolName,
      marks: students.map(s => ({
        admission_no: s.admission_no,
        scored_mark: absentMap[s.admission_no]
          ? null
          : Number(marks[s.admission_no]),
        is_absent: absentMap[s.admission_no] === true,
      })),
    };

    try {
      await API.post("/students/exams/marks", payload);

      setMarks({});
      setAbsentMap({});
      setErrors({});
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong";

      setWarning(message);
      setTimeout(() => setWarning(""), 6000);
    }
  }

  async function handleUpdate() {
    if (!entryId) {
      alert("No exam entry selected");
      return;
    }

    const newErrors = {};

    students.forEach(s => {
      const value = marks[s.admission_no];

      if (
        !absentMap[s.admission_no] &&
        (value === "" || value === undefined)
      ) {
        newErrors[s.admission_no] = "Please Enter Marks";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload = {
      entryId,
      max_mark: Number(maxMark),
      marks: students.map(s => ({
        admission_no: s.admission_no,
        scored_mark: absentMap[s.admission_no]
          ? null
          : marks[s.admission_no] === "" || marks[s.admission_no] == null
            ? undefined
            : Number(marks[s.admission_no]),
        is_absent: absentMap[s.admission_no] === true,
      })),
    };

    await API.put("/students/exams/marks", payload);
    setMarks({});
    setAbsentMap({});
    setErrors({});
  }

  function openConfirm(type) {
    setConfirmType(type);
    setShowConfirm(true);
  }

  function closeConfirm() {
    setShowConfirm(false);
    setConfirmType("");
  }

  async function confirmAction() {
    if (confirmType === "create") {
      await handleSubmit();
    }

    if (confirmType === "edit") {
      await handleUpdate();
    }

    closeConfirm();
  }

  function openAddStudent() {
    setNewStudent({
      admission_no: "",
      name: "",
      gender: "M",
      class: selectedClass,
      division: selectedDivision,
      academic_year: academicYear,
    });

    setShowAddStudent(true);
  }

  async function handleAddStudent() {
    if (!newStudent.admission_no || !newStudent.name) {
      alert("Admission No and Name are required");
      return;
    }

    await API.post("/students", newStudent);

    const res = await API.get("/students/students", {
      params: {
        class: selectedClass,
        division: selectedDivision,
      },
    });
    setStudents(res.data || []);

    setShowAddStudent(false);
    setNewStudent({
      admission_no: "",
      name: "",
      gender: "M",
      class: "",
      division: "",
      academic_year: academicYear,
    });
  }

  function isValidAcademicYear(value) {
    const regex = /^\d{4}-\d{2}$/;
    return regex.test(value);
  }

  /* ================= UI ================= */
  return (
    <MainLayout>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {mode === "view" ? "View Exam Marks" : 
                   mode === "edit" ? "Edit Exam Marks" : "Enter Exam Marks"}
                </h1>
                <p className="text-purple-200 text-sm">
                  Manage student marks and exam records
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {students.length} Students
                </span>
              </div>
              
              {mode === "create" && (
                <button
                  onClick={openAddStudent}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="font-medium">Add Student</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="pt-6 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* WARNING MESSAGE */}
        {warning && (
          <div className="mb-6 animate-slide-in">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl shadow-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{warning}</p>
            </div>
          </div>
        )}

        {/* FILTERS CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Exam Details</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                School Name
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Academic Year
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  value={academicYear}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || isValidAcademicYear(val)) {
                      setAcademicYear(val);
                      setWarning("");
                    } else {
                      setWarning("Academic Year must be in format YYYY-YY (e.g., 2024-25)");
                      setTimeout(() => setWarning(""), 3000);
                    }
                  }}
                  placeholder="2024-25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Exam Name
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  placeholder="Enter Exam Name"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Class
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Division
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none"
                value={selectedDivision}
                onChange={e => setSelectedDivision(e.target.value)}
              >
                {divisions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Marks
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Max"
                value={maxMark}
                onChange={e => setMaxMark(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Term
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition appearance-none"
                value={term}
                onChange={e => setTerm(e.target.value)}
              >
                {terms.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STUDENTS SECTION */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Students List</h2>
                <p className="text-gray-500 text-sm">
                  {selectedClass} - {selectedDivision}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold text-purple-600">{students.length}</span> students
            </div>
          </div>

          {/* STUDENTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map(s => (
              <div
                key={s.admission_no}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border ${
                  absentMap[s.admission_no] 
                    ? 'border-amber-200 bg-amber-50' 
                    : 'border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* AVATAR */}
                  <div className="relative">
                    <img
                      src={s.gender === "F" ? femaleAvatar : maleAvatar}
                      alt="student"
                      className="w-16 h-16 rounded-xl border-2 border-white shadow-sm object-cover"
                    />
                    {absentMap[s.admission_no] && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        Absent
                      </div>
                    )}
                  </div>

                  {/* STUDENT INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-purple-800 truncate">
                          {s.student_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          #{s.admission_no}
                        </p>
                      </div>
                    </div>

                    {/* MARKS INPUT */}
                    {!absentMap[s.admission_no] && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter Marks
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            disabled={mode === "view"}
                            value={marks[s.admission_no] ?? ""}
                            onChange={e => {
                              setMarks(p => ({ ...p, [s.admission_no]: e.target.value }));
                              setErrors(p => ({ ...p, [s.admission_no]: null }));
                            }}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition ${
                              errors[s.admission_no] 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            } ${mode === "view" ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            placeholder={`Out of ${maxMark || 100}`}
                          />
                          {errors[s.admission_no] && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              {errors[s.admission_no]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ABSENT CHECKBOX */}
                    <div className="mt-4">
                      <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        absentMap[s.admission_no] 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } ${mode === "view" ? 'cursor-not-allowed opacity-75' : ''}`}>
                        <input
                          type="checkbox"
                          disabled={mode === "view"}
                          checked={!!absentMap[s.admission_no]}
                          onChange={() => toggleAbsent(s.admission_no)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium">
                          Mark as Absent
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              {mode === "create" && "Ready to submit marks for all students"}
              {mode === "edit" && "Update marks for the selected exam"}
              {mode === "view" && "View mode - No editing allowed"}
            </div>
            
            <div className="flex gap-3">
              {mode === "create" && (
                <>
                  <button
                    onClick={openAddStudent}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span className="font-semibold">Add Student</span>
                  </button>
                  
                  <button
                    onClick={() => openConfirm("create")}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    <Save className="w-5 h-5" />
                    <span className="font-semibold">Submit Marks</span>
                  </button>
                </>
              )}
              
              {mode === "edit" && (
                <button 
                  onClick={() => openConfirm("edit")}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  <Edit className="w-5 h-5" />
                  <span className="font-semibold">Update Marks</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all animate-scale-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {confirmType === "create" 
                  ? "Confirm Submission" 
                  : "Confirm Update"}
              </h3>
              <p className="text-gray-600">
                {confirmType === "create"
                  ? "Are you sure you want to submit marks for all students?"
                  : "Are you sure you want to update the marks for this exam?"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition font-medium"
              >
                {confirmType === "create" ? "Submit" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg transform transition-all animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Add New Student</h3>
                <p className="text-gray-600 text-sm">
                  Fill in the student details below
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Admission No *
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  placeholder="Enter admission number"
                  value={newStudent.admission_no}
                  onChange={(e) =>
                    setNewStudent(p => ({ ...p, admission_no: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  placeholder="Enter student name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent(p => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  value={newStudent.gender}
                  onChange={(e) =>
                    setNewStudent(p => ({ ...p, gender: e.target.value }))
                  }
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed"
                  value={newStudent.class}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Division
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed"
                  value={newStudent.division}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Academic Year
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed"
                  value={newStudent.academic_year}
                  readOnly
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddStudent(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition font-medium"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  );
}