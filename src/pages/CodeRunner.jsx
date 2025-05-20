import React, { useState, useEffect } from "react";
import styles from "./CodeRunner.module.css";
import Problem from "../components/Problem";
import SubmittedPage from "./SubmittedPage";
import axios from "axios";
import { executeCodeApi, submitTestApi } from "../api/base.api";
import { useLocation, useNavigate } from "react-router-dom";

function CodeRunner({ displayToast }) {
  const { state } = useLocation();
  const testData = state?.testData ?? null;
  const questions = testData?.Question || [];
  const [secondsLeft, setSecondsLeft] = useState(null);
  const navigate = useNavigate();

  // Initialize seconds left
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
      const mins = testData?.duration; // e.g. 33
      if (typeof mins === "number" && mins > 0) {
        setSecondsLeft(mins * 60);
        localStorage.setItem("secondsLeft", mins * 60); // Store initial duration
      }
    }
  }, [testData]);

  // Update localStorage whenever secondsLeft changes
  useEffect(() => {
    if (secondsLeft !== null) {
      localStorage.setItem("secondsLeft", secondsLeft);
    }
  }, [secondsLeft]);

  // Clear localStorage when timer reaches 0
  useEffect(() => {
    if (secondsLeft === 0) {
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

  // Question navigation
  const [activeIdx, setActiveIdx] = useState(0);
  const currentQ = questions[activeIdx] || null;

  // Per-question buffers & results
  const [codeMap, setCodeMap] = useState({}); // { idx: { js, py } }
  const [outputMap, setOutputMap] = useState({}); // { idx: string }
  const [errorMap, setErrorMap] = useState({}); // { idx: string }
  const [submittedMap, setSubmittedMap] = useState({}); // { idx: boolean }
  const [testCaseResults, setTestCaseResults] = useState({}); // { idx: { input: output } }

  // Local editors fed from codeMap when question changes
  const [jsCode, setJsCode] = useState("");
  const [pyCode, setPyCode] = useState("");

  // Initialize local editors with predefinedStructure when active question changes
  useEffect(() => {
    const entry = codeMap[activeIdx] || { js: "", py: "" };
    if (currentQ) {
      setJsCode(currentQ.javascriptPredefinedStructure || entry.js);
      setPyCode(currentQ.pythonPredefinedStructure || entry.py);
    } else {
      setJsCode(entry.js);
      setPyCode(entry.py);
    }
    setOutput(outputMap[activeIdx] || "");
    setError(errorMap[activeIdx] || null);
  }, [activeIdx, currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveBuffer = (idx, lang, val) =>
    setCodeMap((prev) => ({
      ...prev,
      [idx]: {
        js: lang === "js" ? val : prev[idx]?.js || "",
        py: lang === "py" ? val : prev[idx]?.py || "",
      },
    }));

  // Runner state
  const [activeTab, setActiveTab] = useState("javascript");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  const runCodeForInput = async (code, language, input, expectedOutput) => {
    setRunning(true);
    setError(null);
    setOutput("");
    const requestData = {
      language: language,
      version: language === "javascript" ? "18.15.0" : "3.10",
      files: [{ content: code }],
      input: input.join().split("[")[1].split("]")[0],
      expectedOutput: expectedOutput.join().split("[")[1].split("]")[0],
    };
    console.log("type of input is:", typeof input);
    try {
      const res = await axios.post(executeCodeApi, requestData);
      const data = res.data?.output ?? res.data ?? "No output";
      setOutput(String(data));
      return String(data);
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      setError(msg);
      return msg;
    } finally {
      setRunning(false);
    }
  };

  const runAllTestCases = async () => {
    if (!currentQ) return;
    const code = activeTab === "javascript" ? jsCode : pyCode;
    const language = activeTab;
    const testCases = currentQ.testcases;
    // console.log("testcases", typeof testCases);
    let results = {};

    for (const testCase of testCases) {
      const input = testCase.input;
      const expectedOutput = testCase.output;
      const actualOutput = await runCodeForInput(
        code,
        language,
        input,
        expectedOutput
      );
      results[input.join(",")] = actualOutput;
    }

    setTestCaseResults((prev) => ({
      ...prev,
      [activeIdx]: results,
    }));

    // Mark question as submitted
    setSubmittedMap((prev) => ({ ...prev, [activeIdx]: true }));
  };

  // Remove localStorage Data
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
      testCaseResults: testCaseResults,
    };
    const testId = localStorage.getItem("token");
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
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className={styles.pageContainer}>
      {/* LEFT: prompt & navigation */}
      <div className={styles.leftContainer}>
        <Problem
          testData={testData}
          currentIndex={activeIdx}
          setCurrentIndex={setActiveIdx}
        />
      </div>
      {/* RIGHT: timer + editor */}
      <div className={styles.rightContainer}>
        {secondsLeft !== null && (
          <div className={styles.timer}>
            ⏳ Time Left&nbsp;{mmss(secondsLeft)}
            <h3>!!! Every Question Must Be Submitted Individually</h3>
            <button onClick={handleMainSubmit} className={styles.submitBtn}>
              SUBMIT TEST
            </button>
          </div>
        )}
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
              disabled={running}
              className={styles.codeEditor}
            />
          )}
          <button
            onClick={runAllTestCases}
            disabled={running || submittedMap[activeIdx]}
            className={styles.runButton}
          >
            {running ? (
              <>
                <span className={styles.spinner}></span>
                Running…
              </>
            ) : (
              `Run All Test Cases`
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
          <button
            onClick={runAllTestCases}
            disabled={running || submittedMap[activeIdx]}
            className={styles.submitBtn}
          >
            {running ? (
              <>
                <span className={styles.spinner}></span>
                Submitting…
              </>
            ) : submittedMap[activeIdx] ? (
              "Submitted"
            ) : (
              "Run All Test Cases"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodeRunner;
