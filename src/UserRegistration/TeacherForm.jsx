
import { useState, useEffect } from "react";

const SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology"];
const CLASSES = ["Class 7", "Class 8", "Class 9", "Class 10"];
const BATCHES = ["A", "B", "C"];


export default function TeacherForm() {

  const [endorsements, setEndorsements] = useState([]);
  const [userCode2, setUserCode2] = useState("");

  useEffect(() => {
    const code = "TCH-" + Math.floor(10000 + Math.random() * 90000);
    setUserCode2(code);
  }, []);

  // Add a new empty endorsement row
  const addEndorsement = () => {
    setEndorsements([
      ...endorsements,
      { class: "", batch: "", subjects: [] },
    ]);
  };
  const removeEndorsement = (index) => {
    setEndorsements(endorsements.filter((_, i) => i !== index));
  };


  // Update class or batch
  const updateEndorsement = (index, key, value) => {
    const updated = [...endorsements];
    updated[index][key] = value;
    setEndorsements(updated);
  };

  // Toggle subject in endorsement row
  const toggleSubject = (index, subject) => {
    const updated = [...endorsements];
    updated[index].subjects = updated[index].subjects.includes(subject)
      ? updated[index].subjects.filter((s) => s !== subject)
      : [...updated[index].subjects, subject];
    setEndorsements(updated);
  };
  const canAddMore = () => {
    if (endorsements.length === 0) return true;

    const last = endorsements[endorsements.length - 1];
    return (
      last.class &&
      last.batch &&
      last.subjects.length > 0
    );
  };


  return (
    <form>
      {/* BASIC DETAILS */}

      <div className="form-grid">
        <div className="input-group">
          <label>User Code</label>
          <input value={userCode2} readOnly />
        </div>
        <div className="input-group">
          <label>Full Name</label>
          <input />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email" />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" />
        </div>
      </div>

      {/* ENDORSEMENTS */}
      <div className="teacher-section">
        <div className="section-header">
          <h4>Class / Batch / Subject Endorsements</h4>
          <button
            type="button"
            className="add-btn"
            onClick={addEndorsement}
            disabled={!canAddMore()}
            style={{
              opacity: canAddMore() ? 1 : 0.5,
              cursor: canAddMore() ? "pointer" : "not-allowed",
            }}
          >
            ＋ Add
          </button>

        </div>

        {endorsements.map((row, i) => (
          <div key={i} className="endorsement-row">

            {/* REMOVE BUTTON */}
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeEndorsement(i)}
              title="Remove endorsement"
            >
              −
            </button>

            {/* Class */}
            <select
              value={row.class}
              onChange={(e) => updateEndorsement(i, "class", e.target.value)}
            >
              <option value="">Class</option>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Batch */}
            <select
              value={row.batch}
              onChange={(e) => updateEndorsement(i, "batch", e.target.value)}
            >
              <option value="">Batch</option>
              {BATCHES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>

            {/* Subjects (Checkboxes) */}
            <div className="checkbox-group inline">
              {SUBJECTS.map((sub) => (
                <label key={sub} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={row.subjects.includes(sub)}
                    onChange={() => toggleSubject(i, sub)}
                  />
                  {sub}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="submit">Create Teacher</button>
    </form>
  );
}
