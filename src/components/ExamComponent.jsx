import React, { useState, useEffect } from "react";
import styles from "./ExamComponent.module.css";
import { useLocation } from "react-router-dom";

const ExamComponent = ({ testData }) => {
    const [activeTab, setActiveTab] = useState("javascript");
    const [jsCode, setJsCode] = useState("");
    const [pyCode, setPyCode] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [pyodide, setPyodide] = useState(null);
    const [pyodideLoading, setPyodideLoading] = useState(false);
    const [error, setError] = useState(null);
    const [score, setScore] = useState(0);
    const location = useLocation();

    const question =
        "Write a function that greets a user by name. If no name is provided, it should greet 'world'.";
    const testCases = [
        { input: "", expected: "Hello, world!" },
        { input: "Alice", expected: "Hello, Alice!" },
        { input: "Bob", expected: "Hello, Bob!" },
    ];

    useEffect(() => {
        if (location.state && location.state.testData) {
            console.log("From state", location.state.testData);
        }
    });

    useEffect(() => {
        if (activeTab === "python" && !pyodide && !pyodideLoading) {
            loadPyodide();
        }
    }, [activeTab, pyodide, pyodideLoading]);

    const loadPyodide = async () => {
        setPyodideLoading(true);
        setOutput("Loading Python environment...");
        setError(null);
        try {
            if (typeof window.loadPyodide === "undefined") {
                const script = document.createElement("script");
                script.src =
                    "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js ";
                script.async = true;
                const scriptLoadPromise = new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = () =>
                        reject(new Error("Failed to load Pyodide script"));
                });
                document.head.appendChild(script);
                await scriptLoadPromise;
            }
            const pyodideInstance = await window.loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/ ",
            });
            setPyodide(pyodideInstance);
            setOutput(
                "Python environment loaded successfully! Ready to run code."
            );
        } catch (err) {
            console.error("Failed to load Pyodide:", err);
            setError(`Failed to load Python environment: ${err.message}`);
        } finally {
            setPyodideLoading(false);
        }
    };

    const runJavaScript = async () => {
        setIsRunning(true);
        setOutput("");
        setError(null);
        let correctTests = 0;
        try {
            for (const testCase of testCases) {
                const executeCode = new Function(
                    `return (async () => { try { return (${jsCode})("${testCase.input}") } catch(e) { console.error(e); return null; } })()`
                );
                const result = await executeCode();
                if (result === testCase.expected) {
                    correctTests++;
                }
            }
            setScore((correctTests / testCases.length) * 100);
        } catch (err) {
            setError(`JavaScript execution error: ${err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const runPython = async () => {
        if (!pyodide) {
            setError("Python environment is not loaded yet");
            return;
        }
        setIsRunning(true);
        setOutput("Running Python code...");
        setError(null);
        let correctTests = 0;
        try {
            pyodide.runPython(`
        import sys
        from io import StringIO
        class CaptureOutput:
            def __enter__(self):
                self.old_stdout = sys.stdout
                self.old_stderr = sys.stderr
                self.stdout_buffer = StringIO()
                self.stderr_buffer = StringIO()
                sys.stdout = self.stdout_buffer
                sys.stderr = self.stderr_buffer
                return self
            def __exit__(self, exc_type, exc_value, traceback):
                sys.stdout = self.old_stdout
                sys.stderr = self.old_stderr
            def get_output(self):
                return self.stdout_buffer.getvalue().strip()
      `);
            for (const testCase of testCases) {
                const result = pyodide.runPython(`
        with CaptureOutput() as output:
            try:
                exec(f"print(({pyCode})('{testCase.input}'))")
                result = output.get_output()
            except Exception as e:
                result = str(e)
        result
      `);
                if (result === testCase.expected) {
                    correctTests++;
                }
            }
            setScore((correctTests / testCases.length) * 100);
        } catch (err) {
            setError(`Python execution error: ${err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const runCode = () => {
        if (activeTab === "javascript") {
            runJavaScript();
        } else {
            runPython();
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Coding Exam</h1>
            <div className={styles.questionSection}>
                <h2 className={styles.questionTitle}>Question:</h2>
                <p className={styles.questionText}>{question}</p>
            </div>
            <div className={styles.testCasesSection}>
                <h2 className={styles.testCasesTitle}>Test Cases:</h2>
                <ul className={styles.testCasesList}>
                    {testCases.map((testCase, index) => (
                        <li key={index} className={styles.testCaseItem}>
                            <strong>Input:</strong> "{testCase.input}"<br />
                            <strong>Expected Output:</strong> "
                            {testCase.expected}"
                        </li>
                    ))}
                </ul>
            </div>
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
                    Python{" "}
                    {pyodideLoading && (
                        <span className={styles.miniSpinner}></span>
                    )}
                </button>
            </div>
            <div className={styles.codeContainer}>
                {activeTab === "javascript" ? (
                    <textarea
                        value={jsCode}
                        onChange={(e) => setJsCode(e.target.value)}
                        className={styles.codeEditor}
                        placeholder="Enter JavaScript code here..."
                        disabled={isRunning}
                    />
                ) : (
                    <textarea
                        value={pyCode}
                        onChange={(e) => setPyCode(e.target.value)}
                        className={styles.codeEditor}
                        placeholder="Enter Python code here..."
                        disabled={isRunning || pyodideLoading}
                    />
                )}
                <button
                    onClick={runCode}
                    disabled={
                        isRunning ||
                        (activeTab === "python" && (pyodideLoading || !pyodide))
                    }
                    className={styles.runButton}
                >
                    {isRunning ? (
                        <>
                            <span className={styles.spinner}></span>
                            Running...
                        </>
                    ) : pyodideLoading && activeTab === "python" ? (
                        <>
                            <span className={styles.spinner}></span>
                            Loading Python...
                        </>
                    ) : (
                        `Run ${
                            activeTab === "javascript" ? "JavaScript" : "Python"
                        }`
                    )}
                </button>
            </div>
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
            <div className={styles.scoreSection}>
                <h2 className={styles.scoreTitle}>Score: {score}%</h2>
            </div>
        </div>
    );
};

export default ExamComponent;
