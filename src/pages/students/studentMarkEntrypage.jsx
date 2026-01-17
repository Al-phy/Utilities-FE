import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api";
import maleAvatar from "../../assets/dummymale.png";
import femaleAvatar from "../../assets/dummyfemale.png";


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
  }, [entryId, students, term]); // 👈 term added


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
      return; // ❌ STOP API CALL
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
            : Number(marks[s.admission_no]), // ✅ "0" → 0
        is_absent: absentMap[s.admission_no] === true,
      })),
    };

    await API.put("/students/exams/marks", payload);
    setMarks({});
    setAbsentMap({});
    setErrors({});
  }

  function openConfirm(type) {
    setConfirmType(type); // "create" or "edit"
    setShowConfirm(true);
  }

  function closeConfirm() {
    setShowConfirm(false);
    setConfirmType("");
  }

  async function confirmAction() {
    if (confirmType === "create") {
      await handleSubmit(); // your existing submit function
    }

    if (confirmType === "edit") {
      await handleUpdate(); // your existing update function
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

    // reload students list
    const res = await API.get("/students/students", {
      params: {
        class: selectedClass,
        division: selectedDivision,
      },
    });
    setStudents(res.data || []);

    // close modal & reset
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
    // Matches 4 digits, dash, 2 digits: 2024-25 ✅
    const regex = /^\d{4}-\d{2}$/;
    return regex.test(value);
  }





  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}

      {/* CONTENT */}
      <main className="pt-6 max-w-7xl mx-auto px-6">

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <input className="input" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          <input
            className="input"
            value={academicYear}
            onChange={e => {
              const val = e.target.value;

              // Only allow valid format
              if (val === "" || isValidAcademicYear(val)) {
                setAcademicYear(val);
                setWarning(""); // clear warning if valid
              } else {
                setWarning("Academic Year must be in format YYYY-YY (e.g., 2024-25)");
                setTimeout(() => setWarning(""), 3000);
              }
            }}
          />
          <input className="input" placeholder="Enter Exam Name" value={examName} onChange={e => setExamName(e.target.value)} />
          <select className="input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input" value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)}>
            {divisions.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="number" className="input" placeholder="Max" value={maxMark} onChange={e => setMaxMark(e.target.value)} />
          <select
            className="input"
            value={term}
            onChange={e => setTerm(e.target.value)}
          >
            {terms.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>


        </div>

        {/* STUDENTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {students.map(s => {


            return (
              <div
                key={s.admission_no}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition p-5 flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-800">
                    {s.student_name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {s.admission_no}
                  </div>

                  {!absentMap[s.admission_no] && (
                    <>
                      <input
                        type="number"
                        disabled={mode === "view"}
                        value={marks[s.admission_no] ?? ""}
                        onChange={e => {
                          setMarks(p => ({ ...p, [s.admission_no]: e.target.value }));
                          setErrors(p => ({ ...p, [s.admission_no]: null }));
                        }}
                        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                      />

                      {errors[s.admission_no] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[s.admission_no]}
                        </p>
                      )}
                    </>
                  )}


                  <label className="flex items-center gap-2 mt-3 text-sm">
                    <input
                      type="checkbox"
                      disabled={mode === "view"}
                      checked={!!absentMap[s.admission_no]}
                      onChange={() => toggleAbsent(s.admission_no)}
                    />
                    Absent
                  </label>
                </div>

                {/* AVATAR */}
                <img
                  src={s.gender === "F" ? femaleAvatar : maleAvatar}
                  alt="student"
                  className="w-20 h-20 rounded-xl ml-4 bg-slate-100 object-contain"
                />

              </div>
            );
          })}
        </div>

        {/* ACTION */}

        <div className="flex justify-end mt-10 gap-x-6">
          {mode === "create" && (
            <>
              <button
                onClick={openAddStudent}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
              >
                Add Student
              </button>


              <button
                onClick={() => openConfirm("create")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Submit
              </button>
            </>
          )}
          {mode === "edit" && (
            <button onClick={() => openConfirm("edit")}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Update
            </button>
          )}


        </div>
      </main>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold text-slate-800">
              {confirmType === "create"
                ? "Are You Sure to Submit Marks?"
                : "Are You Sure to Update Marks?"}
            </h2>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmAction}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Add New Student
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="input"
                placeholder="Admission No"
                value={newStudent.admission_no}
                onChange={(e) =>
                  setNewStudent(p => ({ ...p, admission_no: e.target.value }))
                }
              />

              <input
                className="input"
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent(p => ({ ...p, name: e.target.value }))
                }
              />

              <select
                className="input"
                value={newStudent.gender}
                onChange={(e) =>
                  setNewStudent(p => ({ ...p, gender: e.target.value }))
                }
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>

              <input className="input bg-slate-100 cursor-not-allowed" value={newStudent.class} disabled />
              <input className="input bg-slate-100 cursor-not-allowed" value={newStudent.division} disabled />
              <input className="input bg-slate-100 cursor-not-allowed" value={newStudent.academic_year} disabled />

            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddStudent(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button onClick={handleAddStudent}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {warning && (
        <div className="fixed top-5 right-5 z-9999">
          <div className="flex items-start gap-3 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl shadow-lg max-w-sm animate-slide-in">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium leading-snug">
              {warning}
            </p>
          </div>
        </div>
      )}


    </div>
  );
}
