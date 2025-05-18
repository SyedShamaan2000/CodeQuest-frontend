import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import "./TestCaseModal.css";

export default function TestCaseModal({
    visible,
    initialCases,
    onSave,
    onCancel,
}) {
    const [rows, setRows] = useState([]);

    // Format incoming data for display (convert array to string)
    useEffect(() => {
        if (initialCases && initialCases.length) {
            const formatted = initialCases.map((r, i) => ({
                ...r,
                input: Array.isArray(r.input)
                    ? r.input.join(",")
                    : r.input || "",
                output: Array.isArray(r.output)
                    ? r.output.join(",")
                    : r.output || "",
                id: i + 1,
            }));
            setRows(formatted);
        } else {
            setRows([{ id: 1, input: "", output: "" }]);
        }
    }, [initialCases]);

    const addRow = () =>
        setRows((r) => [...r, { id: r.length + 1, input: "", output: "" }]);

    const updateRow = (idx, field, value) =>
        setRows((r) =>
            r.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
        );

    const deleteRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));

    const handleSave = () => {
        const hasEmpty = rows.some(
            (row) => !row.input.trim() || !row.output.trim()
        );
        if (hasEmpty) {
            alert("Please fill in both Input and Output for all test cases.");
            return;
        }

        const formattedRows = rows.map((row) => ({
            input: Array.isArray(row.input)
                ? row.input.map((s) => s.trim())
                : row.input.split(",").map((s) => s.trim()),
            output: Array.isArray(row.output)
                ? row.output.map((s) => s.trim())
                : row.output.split(",").map((s) => s.trim()),
        }));

        onSave(formattedRows);
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Add Test Cases</h3>
                <p className="note">
                    Note: For multiple values separate with{" "}
                    <code>comma(,)</code>
                </p>
                <button className="btn add-row" onClick={addRow}>
                    + ADD ROW
                </button>
                <div className="rows">
                    {rows.map((row, idx) => (
                        <div key={row.id} className="row">
                            <input
                                type="text"
                                placeholder="Input"
                                value={row.input}
                                onChange={(e) =>
                                    updateRow(idx, "input", e.target.value)
                                }
                            />
                            <input
                                type="text"
                                placeholder="Output"
                                value={row.output}
                                onChange={(e) =>
                                    updateRow(idx, "output", e.target.value)
                                }
                            />
                            <button
                                className="btn delete"
                                onClick={() => deleteRow(idx)}
                                aria-label="Delete row"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="actions">
                    <button className="btn save" onClick={handleSave}>
                        SAVE
                    </button>
                    <button className="btn cancel" onClick={onCancel}>
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
}
