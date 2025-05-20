import React, { useState, useEffect } from "react";
import styles from "./CodeRunner.module.css";
import Problem from "../components/Problem";
import SubmittedPage from "../pages/SubmittedPage"; // adjust path if needed
import { useLocation } from "react-router-dom";
import axios from "axios";
import { executeCodeApi } from "../api/base.api";

function CodeRunner() {
    /* ──────────── TIMER (minutes ➜ seconds) ──────────── */
    const location = useLocation();
    const [secondsLeft, setSecondsLeft] = useState(null);

    // Set initial seconds when testData arrives
    useEffect(() => {
        const mins = location.state?.testData?.duration; // e.g. 33
        if (typeof mins === "number" && mins > 0) {
            setSecondsLeft(mins * 60);
        }
    }, [location.state]);

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
    /* ─────────────────────────────────────────────────── */

    /* ────────── EDITOR / RUNNER STATE ────────── */
    const [activeTab, setActiveTab] = useState("javascript");
    const [jsCode, setJsCode] = useState('console.log("Hello JS!");');
    const [pyCode, setPyCode] = useState('print("Hello Python!")');
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    /* ─────────────────────────────────────────── */

    /* ───────────── HELPERS / RUNNERS ──────────── */
    const fmt = (v) =>
        v === null
            ? "null"
            : v === undefined
            ? "undefined"
            : typeof v === "object"
            ? JSON.stringify(v, null, 2)
            : String(v);

    const runCode = async () => {
        setIsRunning(true);
        setOutput("");
        setError(null);
        const code = activeTab === "javascript" ? jsCode : pyCode;
        const requestData = {
            language: activeTab,
            version: activeTab === "javascript" ? "18.15.0" : "3.10", // Adjust versions as necessary
            files: [
                {
                    content: code,
                },
            ],
        };
        console.log(activeTab);

        console.log(requestData);
        console.log(jsCode);

        try {
            const response = await axios.post(executeCodeApi, requestData);
            const data = response.data;

            setOutput(data || "No output");
        } catch (e) {
            setError(e.response?.data?.error || e.message);
        } finally {
            setIsRunning(false);
        }
    };

    /* ===== Decide which UI to render AFTER all hooks ===== */
    if (secondsLeft === 0) {
        return <SubmittedPage />;
    }

    return (
        <div className={styles.pageContainer}>
            {/* LEFT – problem statement */}
            <div className={styles.leftContainer}>
                <Problem testData={location.state?.testData} />
            </div>

            {/* RIGHT – timer + editor/output */}
            <div className={styles.rightContainer}>
                {secondsLeft !== null && (
                    <div className={styles.timer}>
                        ⏳ Time Left&nbsp;{mmss(secondsLeft)}
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
                            onChange={(e) => setJsCode(e.target.value)}
                            className={styles.codeEditor}
                            disabled={isRunning}
                        />
                    ) : (
                        <textarea
                            value={pyCode}
                            onChange={(e) => setPyCode(e.target.value)}
                            className={styles.codeEditor}
                            disabled={isRunning}
                        />
                    )}

                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className={styles.runButton}
                    >
                        {isRunning ? (
                            <>
                                <span className={styles.spinner}></span>
                                Running…
                            </>
                        ) : (
                            `Run ${
                                activeTab === "javascript"
                                    ? "JavaScript"
                                    : "Python"
                            }`
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
                        {output ||
                            `No output yet. Run your ${activeTab} code to see results.`}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default CodeRunner;
