// import React, { useState, useEffect } from "react";
// import styles from "./CodeRunner.module.css";
// import Problem from "../components/Problem";
// import SubmittedPage from "../pages/SubmittedPage";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import { executeCodeApi } from "../api/base.api";

// /* ───────────────────────────────────────────── */

// function CodeRunner() {
//   const { state }     = useLocation();
//   const testData      = state?.testData ?? null;
//   const questions     = testData?.Question || [];

//   /* ───────── Global timer ───────── */
//   const [secondsLeft, setSecondsLeft] = useState(null);
//   useEffect(() => {
//     const mins = testData?.duration;
//     if (typeof mins === "number" && mins > 0) setSecondsLeft(mins * 60);
//   }, [testData]);
//   useEffect(() => {
//     if (secondsLeft === null) return;
//     const id = setInterval(() => setSecondsLeft(p => (p > 0 ? p - 1 : 0)), 1000);
//     return () => clearInterval(id);
//   }, [secondsLeft]);
//   const mmss = t =>
//     `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

//   /* ───────── Question navigation ───────── */
//   const [activeIdx, setActiveIdx] = useState(0);
//   const currentQ                  = questions[activeIdx] || null;

//   /* ───────── Per-question buffers & results ───────── */
//   const [codeMap,   setCodeMap]   = useState({});   // { idx: { js, py } }
//   const [outputMap, setOutputMap] = useState({});   // { idx: string }
//   const [errorMap,  setErrorMap]  = useState({});   // { idx: string }

//   /* local editors fed from codeMap when question changes */
//   const [jsCode, setJsCode] = useState("");
//   const [pyCode, setPyCode] = useState("");

//   useEffect(() => {
//     const entry = codeMap[activeIdx] || { js: "", py: "" };
//     setJsCode(entry.js);
//     setPyCode(entry.py);
//     setOutput(outputMap[activeIdx] || "");
//     setError(errorMap[activeIdx] || null);
//   }, [activeIdx]);          // eslint-disable-line react-hooks/exhaustive-deps

//   const saveBuffer = (idx, lang, val) =>
//     setCodeMap(prev => ({
//       ...prev,
//       [idx]: { js: lang === "js" ? val : prev[idx]?.js || "",
//                py: lang === "py" ? val : prev[idx]?.py || "" }
//     }));

//   /* ───────── Runner state ───────── */
//   const [activeTab, setActiveTab] = useState("javascript");
//   const [output,    setOutput]    = useState("");
//   const [error,     setError]     = useState(null);
//   const [running,   setRunning]   = useState(false);

//   const runCode = async () => {
//     if (!currentQ) return;
//     setRunning(true);
//     setError(null);
//     setOutput("");

//     const code = activeTab === "javascript" ? jsCode : pyCode;
//     const requestData = {
//       language: activeTab,
//       version: activeTab === "javascript" ? "18.15.0" : "3.10",
//       files: [{ content: code }],
//     };

//     try {
//       const res  = await axios.post(executeCodeApi, requestData);
//       const data = res.data?.output ?? res.data ?? "No output";
//       setOutput(String(data));
//       // remember result for this question
//       setOutputMap(prev => ({ ...prev, [activeIdx]: String(data) }));
//       setErrorMap(prev  => ({ ...prev, [activeIdx]: null }));
//     } catch (e) {
//       const msg = e.response?.data?.error || e.message;
//       setError(msg);
//       setErrorMap(prev => ({ ...prev, [activeIdx]: msg }));
//     } finally {
//       setRunning(false);
//     }
//   };

//   /* ───────── End-of-time screen ───────── */
//   if (secondsLeft === 0) return <SubmittedPage />;

//   return (
//     <div className={styles.pageContainer}>
//       {/* ---------- LEFT: prompt & navigation ---------- */}
//       <div className={styles.leftContainer}>
//         <Problem
//           testData={testData}
//           currentIndex={activeIdx}
//           setCurrentIndex={setActiveIdx}
//         />
//       </div>

//       {/* ---------- RIGHT: timer + editor ---------- */}
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
//           </button>
//         </div>

//         {/* Editor */}
//         <div className={styles.codeContainer}>
//           {activeTab === "javascript" ? (
//             <textarea
//               value={jsCode}
//               onChange={e => {
//                 setJsCode(e.target.value);
//                 saveBuffer(activeIdx, "js", e.target.value);
//               }}
//               disabled={running}
//               className={styles.codeEditor}
//             />
//           ) : (
//             <textarea
//               value={pyCode}
//               onChange={e => {
//                 setPyCode(e.target.value);
//                 saveBuffer(activeIdx, "py", e.target.value);
//               }}
//               disabled={running}
//               className={styles.codeEditor}
//             />
//           )}

//           <button
//             onClick={runCode}
//             disabled={running}
//             className={styles.runButton}
//           >
//             {running ? (
//               <>
//                 <span className={styles.spinner}></span>
//                 Running…
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
//               `Run your ${activeTab} code to see results.`}
//           </pre>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CodeRunner;

import React, { useState, useEffect } from "react";
import styles from "./CodeRunner.module.css";
import Problem from "../components/Problem";
import SubmittedPage from "./SubmittedPage";
import axios from "axios";
import { executeCodeApi, submitTestApi } from "../api/base.api";
import { useLocation, useNavigate } from "react-router-dom";

/* ───────────────────────────────────────────── */

function CodeRunner({ displayToast }) {
  const { state } = useLocation();
  const testData = state?.testData ?? null;
  const questions = testData?.Question || [];

  /* ───────── Global timer ───────── */
  const [secondsLeft, setSecondsLeft] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const mins = testData?.duration;
    if (typeof mins === "number" && mins > 0) setSecondsLeft(mins * 60);
  }, [testData]);

  // Load initial seconds from localStorage if available, otherwise use testData duration
  useEffect(() => {
    const storedSeconds = localStorage.getItem("secondsLeft");
    if (storedSeconds) {
      setSecondsLeft(Number(storedSeconds));
    } else {
      const mins = location.state?.testData?.duration; // e.g. 33
      if (typeof mins === "number" && mins > 0) {
        setSecondsLeft(mins * 60);
        localStorage.setItem("secondsLeft", mins * 60); // Store initial duration
      }
    }
  }, [location.state]);

  // Update localStorage whenever secondsLeft changes
  useEffect(() => {
    if (secondsLeft !== null) {
      localStorage.setItem("secondsLeft", secondsLeft);
    }
  }, [secondsLeft]);

  // Clear localStorage when timer reaches 0
  useEffect(() => {
    if (secondsLeft === 0) {
    //   displayToast("Test Submitted");
      handleMainSubmit();
    }
  }, [secondsLeft]);

  // Tick every second
  useEffect(() => {
    if (secondsLeft === null) return;
    const id = setInterval(
      () => setSecondsLeft((p) => (p > 0 ? p - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [secondsLeft]);

  // MM:SS helper
  const mmss = (tot) =>
    `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(
      tot % 60
    ).padStart(2, "0")}`;

  /* ───────── Question navigation ───────── */
  const [activeIdx, setActiveIdx] = useState(0);
  const currentQ = questions[activeIdx] || null;

  /* ───────── Per-question buffers & results ───────── */
  const [codeMap, setCodeMap] = useState({}); // { idx: { js, py } }
  const [outputMap, setOutputMap] = useState({}); // { idx: string }
  const [errorMap, setErrorMap] = useState({}); // { idx: string }

  /* local editors fed from codeMap when question changes */
  const [jsCode, setJsCode] = useState("");
  const [pyCode, setPyCode] = useState("");

  useEffect(() => {
    const entry = codeMap[activeIdx] || { js: "", py: "" };
    setJsCode(entry.js);
    setPyCode(entry.py);
    setOutput(outputMap[activeIdx] || "");
    setError(errorMap[activeIdx] || null);
  }, [activeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveBuffer = (idx, lang, val) =>
    setCodeMap((prev) => ({
      ...prev,
      [idx]: {
        js: lang === "js" ? val : prev[idx]?.js || "",
        py: lang === "py" ? val : prev[idx]?.py || "",
      },
    }));

  /* ───────── Runner state ───────── */
  const [activeTab, setActiveTab] = useState("javascript");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  const runCode = async () => {
    if (!currentQ) return;
    setRunning(true);
    setError(null);
    setOutput("");

    const code = activeTab === "javascript" ? jsCode : pyCode;
    const requestData = {
      language: activeTab,
      version: activeTab === "javascript" ? "18.15.0" : "3.10",
      files: [{ content: code }],
    };

    try {
      const res = await axios.post(executeCodeApi, requestData);
      const data = res.data?.output ?? res.data ?? "No output";
      setOutput(String(data));
      // remember result for this question
      setOutputMap((prev) => ({ ...prev, [activeIdx]: String(data) }));
      setErrorMap((prev) => ({ ...prev, [activeIdx]: null }));
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      setError(msg);
      setErrorMap((prev) => ({ ...prev, [activeIdx]: msg }));
    } finally {
      setRunning(false);
    }
  };

  // remove localStorage Data
  function removeLocalStorageData() {
    if (localStorage.getItem("token")) {
        localStorage.removeItem("token");
      }
      if (localStorage.getItem("secondsLeft")) {
        localStorage.removeItem("secondsLeft");
      }
      displayToast("Test Submitted");
      navigate("/submitted");
  }

  const handleMainSubmit = () => {
    const submitData = {
      name: localStorage.getItem("userName"),
      email: localStorage.getItem("userEmail"),
      score: 0,
    };
    const testId = localStorage.getItem("token");
    // console.log(submitData);
    fetch(`${submitTestApi}/${testId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .then(removeLocalStorageData())
      .catch((error) => console.error("Error:", error))
  };

  return (
    <div className={styles.pageContainer}>
      {/* ---------- LEFT: prompt & navigation ---------- */}
      <div className={styles.leftContainer}>
        <Problem
          testData={testData}
          currentIndex={activeIdx}
          setCurrentIndex={setActiveIdx}
        />
      </div>

      {/* ---------- RIGHT: timer + editor ---------- */}
      <div className={styles.rightContainer}>
        {secondsLeft !== null && (
          <div className={styles.timer}>
            ⏳ Time Left&nbsp;{mmss(secondsLeft)}
          </div>
        )}
        <button onClick={handleMainSubmit}>SUBMIT TEST</button>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "javascript" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("javascript")}
          >
            JavaScript
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "python" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("python")}
          >
            Python
          </button>
        </div>

        {/* Editor */}
        <div className={styles.codeContainer}>
          {activeTab === "javascript" ? (
            <textarea
              value={jsCode}
              onChange={(e) => {
                setJsCode(e.target.value);
                saveBuffer(activeIdx, "js", e.target.value);
              }}
              onPaste={e => e.preventDefault()}
              disabled={running}
              className={styles.codeEditor}
            />
          ) : (
            <textarea
              value={pyCode}
              onChange={(e) => {
                setPyCode(e.target.value);
                saveBuffer(activeIdx, "py", e.target.value);
              }}
              onPaste={e => e.preventDefault()}
              disabled={running}
              className={styles.codeEditor}
            />
          )}

          <button
            onClick={runCode}
            disabled={running}
            className={styles.runButton}
          >
            {running ? (
              <>
                <span className={styles.spinner}></span>
                Running…
              </>
            ) : (
              `Run ${activeTab === "javascript" ? "JavaScript" : "Python"}`
            )}
          </button>
        </div>

        {/* Output */}
        <div className={styles.outputSection}>
          <h2 className={styles.outputTitle}>Output:</h2>
          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span> {error}
            </div>
          )}
          <pre className={styles.outputDisplay}>
            {output || `Run your ${activeTab} code to see results.`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CodeRunner;
