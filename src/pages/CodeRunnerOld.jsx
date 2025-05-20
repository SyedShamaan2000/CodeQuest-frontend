// // src/components/CodeRunner.jsx
// import React, { useState, useEffect } from "react";
// import styles from "./CodeRunner.module.css";
// import Problem from "../components/Problem";
// import SubmittedPage from "../pages/SubmittedPage";       // adjust path if needed
// import { useLocation } from "react-router-dom";

// function CodeRunner() {
//   /* ──────────── TIMER (minutes ➜ seconds) ──────────── */
//   const location = useLocation();
//   const [secondsLeft, setSecondsLeft] = useState(null);

//   // Set initial seconds when testData arrives
//   useEffect(() => {
//     const mins = location.state?.testData?.duration;        // e.g. 33
//     if (typeof mins === "number" && mins > 0) {
//       setSecondsLeft(mins * 60);
//     }
//   }, [location.state]);

//   // Tick every second
//   useEffect(() => {
//     if (secondsLeft === null) return;
//     const id = setInterval(
//       () => setSecondsLeft((p) => (p > 0 ? p - 1 : 0)),
//       1000
//     );
//     return () => clearInterval(id);
//   }, [secondsLeft]);

//   // MM:SS helper
//   const mmss = (tot) =>
//     `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(
//       tot % 60
//     ).padStart(2, "0")}`;
//   /* ─────────────────────────────────────────────────── */

//   /* ────────── EDITOR / RUNNER STATE ────────── */
//   const [activeTab, setActiveTab] = useState("javascript");
//   const [jsCode, setJsCode] = useState('console.log("Hello JS!");');
//   const [pyCode, setPyCode] = useState('print("Hello Python!")');
//   const [output, setOutput] = useState("");
//   const [isRunning, setIsRunning] = useState(false);
//   const [pyodide, setPyodide] = useState(null);
//   const [pyodideLoading, setPyodideLoading] = useState(false);
//   const [error, setError] = useState(null);
//   /* ─────────────────────────────────────────── */

//   /* ────────── LOAD PYODIDE ON DEMAND ────────── */
//   useEffect(() => {
//     if (activeTab === "python" && !pyodide && !pyodideLoading) loadPyodide();
//   }, [activeTab, pyodide, pyodideLoading]);

//   async function loadPyodide() {
//     setPyodideLoading(true);
//     setOutput("Loading Python environment…");
//     setError(null);
//     try {
//       if (typeof window.loadPyodide === "undefined") {
//         await new Promise((res, rej) => {
//           const s = document.createElement("script");
//           s.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
//           s.async = true;
//           s.onload = res;
//           s.onerror = () => rej(new Error("Pyodide load failed"));
//           document.head.appendChild(s);
//         });
//       }
//       const inst = await window.loadPyodide({
//         indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
//       });
//       setPyodide(inst);
//       setOutput("Python ready!");
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setPyodideLoading(false);
//     }
//   }
//   /* ─────────────────────────────────────────── */

//   /* ───────────── HELPERS / RUNNERS ──────────── */
//   const fmt = (v) =>
//     v === null
//       ? "null"
//       : v === undefined
//       ? "undefined"
//       : typeof v === "object"
//       ? JSON.stringify(v, null, 2)
//       : String(v);

//   const runJavaScript = async () => {
//     setIsRunning(true);
//     setOutput("");
//     setError(null);
//     try {
//       const original = { ...console };
//       let buf = [];
//       ["log", "warn", "error", "info"].forEach((lvl) => {
//         console[lvl] = (...a) => {
//           original[lvl](...a);
//           buf.push(
//             (lvl === "log" ? "" : lvl.toUpperCase() + ": ") +
//               a.map(fmt).join(" ")
//           );
//         };
//       });

//       const res = await new Function(
//         `(async () => { try { ${jsCode} } catch(e){ console.error(e); } })()`
//       )();
//       if (res !== undefined) buf.push("Return: " + fmt(res));
//       setOutput(buf.join("\n") || "No output");
//       Object.assign(console, original);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   const runPython = async () => {
//     if (!pyodide) return setError("Python not ready");
//     setIsRunning(true);
//     setOutput("Running Python…");
//     setError(null);
//     try {
//       const result = pyodide.runPython(`
// import sys, io, contextlib
// @contextlib.contextmanager
// def cap():
//     o, e = io.StringIO(), io.StringIO()
//     oldo, olde = sys.stdout, sys.stderr
//     sys.stdout, sys.stderr = o, e
//     try: yield (o, e)
//     finally: sys.stdout, sys.stderr = oldo, olde
// with cap() as (out, err):
//     try:
//         exec("""${pyCode.replace(/"""/g, '\\"""')}""")
//     except Exception as ex:
//         print(ex, file=sys.stderr)
// out.getvalue() + err.getvalue()
// `);
//       setOutput(result || "No output");
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   const runCode = () =>
//     activeTab === "javascript" ? runJavaScript() : runPython();
//   /* ─────────────────────────────────────────── */

//   /* ===== Decide which UI to render AFTER all hooks ===== */
//   if (secondsLeft === 0) {
//     return <SubmittedPage />;
//   }

//   return (
//     <div className={styles.pageContainer}>
//       {/* LEFT – problem statement */}
//       <div className={styles.leftContainer}>
//         <Problem testData={location.state?.testData} />
//       </div>

//       {/* RIGHT – timer + editor/output */}
//       <div className={styles.rightContainer}>
//         {secondsLeft !== null && (
//           <div className={styles.timer}>
//             ⏳ Time Left&nbsp;{mmss(secondsLeft)}
//           </div>
//         )}

//         {/* Tabs */}
//         <div className={styles.tabs}>
//           <button
//             className={`${styles.tab} ${
//               activeTab === "javascript" ? styles.activeTab : ""
//             }`}
//             onClick={() => setActiveTab("javascript")}
//           >
//             JavaScript
//           </button>
//           <button
//             className={`${styles.tab} ${
//               activeTab === "python" ? styles.activeTab : ""
//             }`}
//             onClick={() => setActiveTab("python")}
//           >
//             Python
//             {pyodideLoading && <span className={styles.miniSpinner}></span>}
//           </button>
//         </div>

//         {/* Editor */}
//         <div className={styles.codeContainer}>
//           {activeTab === "javascript" ? (
//             <textarea
//               value={jsCode}
//               onChange={(e) => setJsCode(e.target.value)}
//               className={styles.codeEditor}
//               disabled={isRunning}
//             />
//           ) : (
//             <textarea
//               value={pyCode}
//               onChange={(e) => setPyCode(e.target.value)}
//               className={styles.codeEditor}
//               disabled={isRunning || pyodideLoading}
//             />
//           )}

//           <button
//             onClick={runCode}
//             disabled={
//               isRunning ||
//               (activeTab === "python" && (pyodideLoading || !pyodide))
//             }
//             className={styles.runButton}
//           >
//             {isRunning ? (
//               <>
//                 <span className={styles.spinner}></span>
//                 Running…
//               </>
//             ) : pyodideLoading && activeTab === "python" ? (
//               <>
//                 <span className={styles.spinner}></span>
//                 Loading Python…
//               </>
//             ) : (
//               `Run ${activeTab === "javascript" ? "JavaScript" : "Python"}`
//             )}
//           </button>
//         </div>

//         {/* Output */}
//         <div className={styles.outputSection}>
//           <h2 className={styles.outputTitle}>Output:</h2>
//           {error && (
//             <div className={styles.errorBox}>
//               <span className={styles.errorIcon}>⚠️</span> {error}
//             </div>
//           )}
//           <pre className={styles.outputDisplay}>
//             {output ||
//               `No output yet. Run your ${activeTab} code to see results.`}
//           </pre>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CodeRunner;

import React, { useState } from "react";
import { executeCodeApi } from "../api/base.api";
import axios from "axios";

const CodeRunner = () => {
    const [sourceCode, setScoreCode] = useState("");

    const handleOnChange = (e) => {
        setScoreCode(e.target.value);
        // console.log(e.target.value);
    };
    async function runCode() {
        const requestData = {
            language: "python",
            version: "3.10",
            files: [
                {
                    content: sourceCode,
                },
            ],
        };
        try {
            const response = await axios.post(executeCodeApi, requestData);
            console.log(response);
            const data = response.data;
            console.log("output", data);
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div>
            <textarea value={sourceCode} onChange={handleOnChange}></textarea>
            <button onClick={runCode}>Run Code</button>
        </div>
    );
};

export default CodeRunner;
