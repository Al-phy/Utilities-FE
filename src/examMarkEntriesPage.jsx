import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function ExamMarkEntriesPage() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        API.get("/students/exams/entries").then(res => {
            const sorted = [...(res.data || [])].sort(
                (a, b) => a.id - b.id
            );
            setEntries(sorted);
        });
    }, []);


    return (
        <>
            <style>{`
        .page-header {
          background: linear-gradient(90deg,#4f46e5,#6366f1);
          color:white;
          padding:16px 24px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .tile-grid {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:20px;
          padding:30px;
        }

        .tile {
          background:white;
          border-radius:14px;
          padding:20px;
          cursor:pointer;
          box-shadow:0 8px 20px rgba(0,0,0,.08);
          transition:.2s;
        }

        .tile:hover {
          transform:translateY(-4px);
          box-shadow:0 12px 30px rgba(0,0,0,.12);
        }

        .modal-backdrop {
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.45);
          display:flex;
          justify-content:center;
          align-items:center;
        }

        .modal {
          background:white;
          width:420px;
          border-radius:14px;
          padding:24px;
        }

        .modal h3 {
          margin-bottom:14px;
        }

        .modal-actions {
          display:flex;
          justify-content:flex-end;
          gap:12px;
          margin-top:20px;
        }

        .btn {
          padding:8px 16px;
          border-radius:8px;
          border:none;
          cursor:pointer;
          font-weight:600;
        }

        .btn-primary { background:#4f46e5; color:white; }
        .btn-outline { background:#eef2ff; color:#4f46e5; }
      `}</style>



            <div className="tile-grid">
                {entries.map((e, i) => (
                    <div key={e.id} className="tile" onClick={() => setSelected(e)}>
                        <h3>M{e.id}</h3>
                        <p>{e.exam_name}</p>
                        <small>{e.class} - {e.division}</small>
                    </div>
                ))}
            </div>

            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>{selected.exam_name}</h3>
                        <p><b>Class:</b> {selected.class}</p>
                        <p><b>Division:</b> {selected.division}</p>
                        <p><b>Subject:</b> {selected.subject}</p>
                        <p><b>Term:</b> {selected.term}</p>

                        <div className="modal-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() =>
                                    navigate("/students", {
                                        state: {
                                            entryId: selected.id,
                                            mode: "view",
                                        },
                                    })
                                }
                            >
                                View
                            </button>


                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate("/students", {
                                        state: {
                                            entryId: selected.id,
                                            mode: "edit",
                                        },
                                    })
                                }
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
