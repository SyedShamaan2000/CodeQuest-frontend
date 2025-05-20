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

  // Format incoming data for display (ensure input and output are arrays)
  useEffect(() => {
    if (initialCases && initialCases.length) {
      const formatted = initialCases.map((r, i) => ({
        ...r,
        input: Array.isArray(r.input)
          ? r.input
          : r.input.split(",").map((s) => s.trim()),
        output: Array.isArray(r.output)
          ? r.output
          : r.output.split(",").map((s) => s.trim()),
        id: r.id || generateUniqueId(), // Use existing id if available, otherwise generate a new one
        javascriptTestCaseCommand: r.javascriptTestCaseCommand || "", // Ensure testCaseCommand is a string
        pythonTestCaseCommand: r.pythonTestCaseCommand || "", // Ensure testCaseCommand is a string
      }));
      setRows(formatted);
    } else {
      setRows([
        {
          id: generateUniqueId(),
          input: [""], // Ensure input is an array
          output: [""], // Ensure output is an array
          javascriptTestCaseCommand: "",
          pythonTestCaseCommand: "",
        },
      ]);
    }
  }, [initialCases]);

  const addRow = () =>
    setRows((r) => [
      ...r,
      {
        id: generateUniqueId(),
        input: [""], // Ensure input is an array
        output: [""], // Ensure output is an array
        javascriptTestCaseCommand: "",
        pythonTestCaseCommand: "",
      },
    ]);

  const updateRow = (idx, field, value) =>
    setRows((r) =>
      r.map((row, i) =>
        i === idx
          ? {
              ...row,
              [field]:
                field === "input" || field === "output"
                  ? value.split(",").map((s) => s.trim())
                  : value,
            }
          : row
      )
    );

  const deleteRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));

  const handleSave = () => {
    const hasEmpty = rows.some(
      (row) =>
        !row.input.some((i) => i.trim()) || !row.output.some((o) => o.trim())
    );
    if (hasEmpty) {
      alert(
        "Please fill in both Input, Output, and Test Commands for all test cases."
      );
      return;
    }

    const formattedRows = rows.map((row) => ({
      input: row.input.map((s) => s.trim()),
      output: row.output.map((s) => s.trim()),
      javascriptTestCaseCommand: row.javascriptTestCaseCommand.trim(),
      pythonTestCaseCommand: row.pythonTestCaseCommand.trim(),
    }));

    onSave(formattedRows);
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Test Cases</h3>
        <p className="note">
          Note: For multiple values separate with <code>comma(,)</code>
        </p>
        <button className="btn add-row" onClick={addRow}>
          + ADD ROW
        </button>
        <div className="rows">
          {rows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <div className="row">
                <input
                  type="text"
                  placeholder="Input"
                  value={Array.isArray(row.input) ? row.input.join(",") : ""}
                  onChange={(e) => updateRow(idx, "input", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Output"
                  value={Array.isArray(row.output) ? row.output.join(",") : ""}
                  onChange={(e) => updateRow(idx, "output", e.target.value)}
                />

                <button
                  className="btn delete"
                  onClick={() => deleteRow(idx)}
                  aria-label="Delete row"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {/* <label>
                JavaScript TestCommand<span className="required">*</span>
                <textarea
                  name="javascriptTestCaseCommand"
                  rows="5"
                  value={row.javascriptTestCaseCommand}
                  onChange={(e) =>
                    updateRow(idx, "javascriptTestCaseCommand", e.target.value)
                  }
                  required
                />
              </label>
              <label>
                Python TestCommand<span className="required">*</span>
                <textarea
                  name="pythonTestCaseCommand"
                  rows="5"
                  value={row.pythonTestCaseCommand}
                  onChange={(e) =>
                    updateRow(idx, "pythonTestCaseCommand", e.target.value)
                  }
                  required
                />
              </label> */}
            </React.Fragment>
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

function generateUniqueId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}
