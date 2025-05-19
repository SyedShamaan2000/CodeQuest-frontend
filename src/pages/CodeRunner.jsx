// import React, { useState, useEffect } from "react";
// import styles from "./CodeRunner.module.css";

// function CodeRunner() {
//     const [activeTab, setActiveTab] = useState("javascript");
//     const [jsCode, setJsCode] = useState(
//         'console.log("Hello from JavaScript!");'
//     );
//     const [pyCode, setPyCode] = useState('print("Hello from Python!")');
//     const [output, setOutput] = useState("");
//     const [isRunning, setIsRunning] = useState(false);
//     const [pyodide, setPyodide] = useState(null);
//     const [pyodideLoading, setPyodideLoading] = useState(false);
//     const [error, setError] = useState(null);

//     // Load Pyodide when Python tab is selected
//     useEffect(() => {
//         if (activeTab === "python" && !pyodide && !pyodideLoading) {
//             loadPyodide();
//         }
//     }, [activeTab, pyodide, pyodideLoading]);

//     async function loadPyodide() {
//         setPyodideLoading(true);
//         setOutput("Loading Python environment...");
//         setError(null);

//         try {
//             // Make sure the global loadPyodide function is available
//             if (typeof window.loadPyodide === "undefined") {
//                 // If not, load the Pyodide script
//                 const script = document.createElement("script");
//                 script.src =
//                     "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
//                 script.async = true;

//                 // Create a promise that resolves when the script loads
//                 const scriptLoadPromise = new Promise((resolve, reject) => {
//                     script.onload = resolve;
//                     script.onerror = () =>
//                         reject(new Error("Failed to load Pyodide script"));
//                 });

//                 document.head.appendChild(script);
//                 await scriptLoadPromise;
//             }

//             // Now load Pyodide itself
//             const pyodideInstance = await window.loadPyodide({
//                 indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
//             });

//             setPyodide(pyodideInstance);
//             setOutput(
//                 "Python environment loaded successfully! Ready to run code."
//             );
//         } catch (err) {
//             console.error("Failed to load Pyodide:", err);
//             setError(`Failed to load Python environment: ${err.message}`);
//         } finally {
//             setPyodideLoading(false);
//         }
//     }

//     const runJavaScript = async () => {
//         setIsRunning(true);
//         setOutput("");
//         setError(null);

//         try {
//             // Create a custom console to capture logs
//             const originalConsole = { ...console };
//             let consoleOutput = [];

//             // Override console methods to capture output
//             const customConsole = {
//                 log: (...args) => {
//                     originalConsole.log(...args);
//                     consoleOutput.push(
//                         args.map((arg) => formatOutput(arg)).join(" ")
//                     );
//                 },
//                 error: (...args) => {
//                     originalConsole.error(...args);
//                     consoleOutput.push(
//                         `Error: ${args
//                             .map((arg) => formatOutput(arg))
//                             .join(" ")}`
//                     );
//                 },
//                 warn: (...args) => {
//                     originalConsole.warn(...args);
//                     consoleOutput.push(
//                         `Warning: ${args
//                             .map((arg) => formatOutput(arg))
//                             .join(" ")}`
//                     );
//                 },
//                 info: (...args) => {
//                     originalConsole.info(...args);
//                     consoleOutput.push(
//                         `Info: ${args
//                             .map((arg) => formatOutput(arg))
//                             .join(" ")}`
//                     );
//                 },
//                 clear: () => {
//                     originalConsole.clear();
//                     consoleOutput = [];
//                 },
//             };

//             // Replace the global console temporarily
//             window.console = customConsole;

//             // Create a function from the code and execute it
//             const executeCode = new Function(
//                 "return (async () => { try { " +
//                     jsCode +
//                     " } catch(e) { console.error(e); } })()"
//             );
//             const result = await executeCode();

//             // Restore the original console
//             window.console = originalConsole;

//             // If there's a return value, add it to the output
//             if (result !== undefined) {
//                 consoleOutput.push(`Return value: ${formatOutput(result)}`);
//             }

//             setOutput(
//                 consoleOutput.join("\n") ||
//                     "Code executed successfully (no output)"
//             );
//         } catch (err) {
//             // Restore the original console in case of error
//             if (window.console !== console) {
//                 window.console = console;
//             }

//             setError(`JavaScript execution error: ${err.message}`);
//         } finally {
//             setIsRunning(false);
//         }
//     };

//     // const runPython = async () => {
//     //     if (!pyodide) {
//     //         setError("Python environment is not loaded yet");
//     //         return;
//     //     }

//     //     setIsRunning(true);
//     //     setOutput("Running Python code...");
//     //     setError(null);

//     //     try {
//     //         // Create a custom stdout capture
//     //         pyodide.runPython(`
//     //     import sys
//     //     from io import StringIO

//     //     class CaptureOutput:
//     //         def __enter__(self):
//     //             self.old_stdout = sys.stdout
//     //             self.old_stderr = sys.stderr
//     //             self.stdout_buffer = StringIO()
//     //             self.stderr_buffer = StringIO()
//     //             sys.stdout = self.stdout_buffer
//     //             sys.stderr = self.stderr_buffer
//     //             return self

//     //         def __exit__(self, exc_type, exc_value, traceback):
//     //             sys.stdout = self.old_stdout
//     //             sys.stderr = self.old_stderr

//     //         def get_output(self):
//     //             return self.stdout_buffer.getvalue() + self.stderr_buffer.getvalue()
//     //   `);

//     //         // Run the user's code with output capturing
//     //         const result = pyodide.runPython(`
//     //     with CaptureOutput() as output:
//     //         try:
//     //             exec("""${pyCode.replace(/"""/g, '\\"\\"\\"')}""")
//     //             result = output.get_output()
//     //         except Exception as e:
//     //             result = str(e)
//     //     result
//     //   `);

//     //         setOutput(
//     //             result || "Python code executed successfully (no output)"
//     //         );
//     //     } catch (err) {
//     //         setError(`Python execution error: ${err.message}`);
//     //     } finally {
//     //         setIsRunning(false);
//     //     }
//     // };
//     const runPython = async () => {
//         if (!pyodide) {
//             setError("Python environment is not loaded yet");
//             return;
//         }
//         setIsRunning(true);
//         setOutput("Running Python code...");
//         setError(null);
//         try {
//             // Create a custom stdout capture
//             pyodide.runPython(`
//             import sys
//             from io import StringIO
//             class CaptureOutput:
//                 def __enter__(self):
//                     self.old_stdout = sys.stdout
//                     self.old_stderr = sys.stderr
//                     self.stdout_buffer = StringIO()
//                     self.stderr_buffer = StringIO()
//                     sys.stdout = self.stdout_buffer
//                     sys.stderr = self.stderr_buffer
//                     return self
//                 def __exit__(self, exc_type, exc_value, traceback):
//                     sys.stdout = self.old_stdout
//                     sys.stderr = self.old_stderr
//                 def get_output(self):
//                     return self.stdout_buffer.getvalue() + self.stderr_buffer.getvalue()
//         `);
//             // Run the user's code with output capturing
//             const result = pyodide.runPython(`
//             with CaptureOutput() as output:
//                 try:
//                     exec("""${pyCode.replace(/"""/g, '\\"\\"\\"')}""")
//                     result = output.get_output()
//                 except Exception as e:
//                     result = str(e)
//             result
//         `);
//             setOutput(
//                 result || "Python code executed successfully (no output)"
//             );
//         } catch (err) {
//             setError(`Python execution error: ${err.message}`);
//         } finally {
//             setIsRunning(false);
//         }
//     };

//     const runCode = () => {
//         if (activeTab === "javascript") {
//             runJavaScript();
//         } else {
//             runPython();
//         }
//     };

//     // Format different types of output for display
//     const formatOutput = (value) => {
//         if (value === null) return "null";
//         if (value === undefined) return "undefined";
//         if (typeof value === "object") {
//             try {
//                 return JSON.stringify(value, null, 2);
//             } catch (e) {
//                 return String(value);
//             }
//         }
//         return String(value);
//     };

//     return (
//         <div className={styles.container}>
//             <h1 className={styles.title}>Code Runner</h1>

//             <div className={styles.tabs}>
//                 <button
//                     className={`${styles.tab} ${
//                         activeTab === "javascript" ? styles.activeTab : ""
//                     }`}
//                     onClick={() => setActiveTab("javascript")}
//                 >
//                     JavaScript
//                 </button>
//                 <button
//                     className={`${styles.tab} ${
//                         activeTab === "python" ? styles.activeTab : ""
//                     }`}
//                     onClick={() => setActiveTab("python")}
//                 >
//                     Python{" "}
//                     {pyodideLoading && (
//                         <span className={styles.miniSpinner}></span>
//                     )}
//                 </button>
//             </div>

//             <div className={styles.codeContainer}>
//                 {activeTab === "javascript" ? (
//                     <textarea
//                         value={jsCode}
//                         onChange={(e) => setJsCode(e.target.value)}
//                         className={styles.codeEditor}
//                         placeholder="Enter JavaScript code here..."
//                         disabled={isRunning}
//                     />
//                 ) : (
//                     <textarea
//                         value={pyCode}
//                         onChange={(e) => setPyCode(e.target.value)}
//                         className={styles.codeEditor}
//                         placeholder="Enter Python code here..."
//                         disabled={isRunning || pyodideLoading}
//                     />
//                 )}

//                 <button
//                     onClick={runCode}
//                     disabled={
//                         isRunning ||
//                         (activeTab === "python" && (pyodideLoading || !pyodide))
//                     }
//                     className={styles.runButton}
//                 >
//                     {isRunning ? (
//                         <>
//                             <span className={styles.spinner}></span>
//                             Running...
//                         </>
//                     ) : pyodideLoading && activeTab === "python" ? (
//                         <>
//                             <span className={styles.spinner}></span>
//                             Loading Python...
//                         </>
//                     ) : (
//                         `Run ${
//                             activeTab === "javascript" ? "JavaScript" : "Python"
//                         }`
//                     )}
//                 </button>
//             </div>

//             <div className={styles.outputSection}>
//                 <h2 className={styles.outputTitle}>Output:</h2>
//                 {error && (
//                     <div className={styles.errorBox}>
//                         <span className={styles.errorIcon}>⚠️</span> {error}
//                     </div>
//                 )}
//                 <pre className={styles.outputDisplay}>
//                     {output ||
//                         `No output yet. Run your ${activeTab} code to see results.`}
//                 </pre>
//             </div>

//             <div className={styles.infoSection}>
//                 <h3 className={styles.infoTitle}>About this Code Runner</h3>
//                 {activeTab === "javascript" ? (
//                     <ul className={styles.infoList}>
//                         <li>
//                             Code runs in your browser's JavaScript environment
//                         </li>
//                         <li>
//                             Use console.log(), console.error(), etc. to see
//                             output
//                         </li>
//                         <li>Return values will be displayed automatically</li>
//                         <li>
//                             For security reasons, some browser APIs may be
//                             restricted
//                         </li>
//                     </ul>
//                 ) : (
//                     <ul className={styles.infoList}>
//                         <li>Python code runs in the browser using Pyodide</li>
//                         <li>Standard Python libraries are available</li>
//                         <li>Use print() to display output</li>
//                         <li>
//                             First run may take a moment to load the Python
//                             environment
//                         </li>
//                     </ul>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default CodeRunner;
import React, { useState, useEffect } from "react";
import styles from "./CodeRunner.module.css";
import { useLocation } from "react-router-dom";

function CodeRunner() {
    const [activeTab, setActiveTab] = useState("javascript");
    const [jsCode, setJsCode] = useState(
        'console.log("Hello from JavaScript!");'
    );
    const [pyCode, setPyCode] = useState('print("Hello from Python!")');
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [pyodide, setPyodide] = useState(null);
    const [pyodideLoading, setPyodideLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");
        console.log(userName);
        console.log(userEmail);

        if (location.state && location.state.testData) {
            console.log("From state", location.state.testData);
        }
    }, [location.state]);

    // Load Pyodide when Python tab is selected
    useEffect(() => {
        if (activeTab === "python" && !pyodide && !pyodideLoading) {
            loadPyodide();
        }
    }, [activeTab, pyodide, pyodideLoading]);

    async function loadPyodide() {
        setPyodideLoading(true);
        setOutput("Loading Python environment...");
        setError(null);
        try {
            // Make sure the global loadPyodide function is available
            if (typeof window.loadPyodide === "undefined") {
                // If not, load the Pyodide script
                const script = document.createElement("script");
                script.src =
                    "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
                script.async = true;
                // Create a promise that resolves when the script loads
                const scriptLoadPromise = new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = () =>
                        reject(new Error("Failed to load Pyodide script"));
                });
                document.head.appendChild(script);
                await scriptLoadPromise;
            }
            // Now load Pyodide itself
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
    }

    const runJavaScript = async () => {
        setIsRunning(true);
        setOutput("");
        setError(null);
        try {
            // Create a custom console to capture logs
            const originalConsole = { ...console };
            let consoleOutput = [];
            // Override console methods to capture output
            const customConsole = {
                log: (...args) => {
                    originalConsole.log(...args);
                    consoleOutput.push(
                        args.map((arg) => formatOutput(arg)).join(" ")
                    );
                },
                error: (...args) => {
                    originalConsole.error(...args);
                    consoleOutput.push(
                        `Error: ${args
                            .map((arg) => formatOutput(arg))
                            .join(" ")}`
                    );
                },
                warn: (...args) => {
                    originalConsole.warn(...args);
                    consoleOutput.push(
                        `Warning: ${args
                            .map((arg) => formatOutput(arg))
                            .join(" ")}`
                    );
                },
                info: (...args) => {
                    originalConsole.info(...args);
                    consoleOutput.push(
                        `Info: ${args
                            .map((arg) => formatOutput(arg))
                            .join(" ")}`
                    );
                },
                clear: () => {
                    originalConsole.clear();
                    consoleOutput = [];
                },
            };
            // Replace the global console temporarily
            window.console = customConsole;
            // Create a function from the code and execute it
            const executeCode = new Function(
                "return (async () => { try { " +
                    jsCode +
                    " } catch(e) { console.error(e); } })()"
            );
            const result = await executeCode();
            // Restore the original console
            window.console = originalConsole;
            // If there's a return value, add it to the output
            if (result !== undefined) {
                consoleOutput.push(`Return value: ${formatOutput(result)}`);
            }
            setOutput(
                consoleOutput.join("\n") ||
                    "Code executed successfully (no output)"
            );
        } catch (err) {
            // Restore the original console in case of error
            if (window.console !== console) {
                window.console = console;
            }
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
        try {
            // Create a custom stdout capture
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
                        return self.stdout_buffer.getvalue() + self.stderr_buffer.getvalue()
            `);
            // Run the user's code with output capturing
            const result = pyodide.runPython(`
                with CaptureOutput() as output:
                    try:
                        exec("""${pyCode.replace(/"""/g, '\\"\\"\\"')}""")
                        result = output.get_output()
                    except Exception as e:
                        result = str(e)
                result
            `);
            setOutput(
                result || "Python code executed successfully (no output)"
            );
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

    // Format different types of output for display
    const formatOutput = (value) => {
        if (value === null) return "null";
        if (value === undefined) return "undefined";
        if (typeof value === "object") {
            try {
                return JSON.stringify(value, null, 2);
            } catch (error) {
                console.error(error);
                return String(value);
            }
        }
        return String(value);
    };

    return (
        <div className={styles.container}>
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
            <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>About this Code Runner</h3>
                {activeTab === "javascript" ? (
                    <ul className={styles.infoList}>
                        <li>
                            Code runs in your browser's JavaScript environment
                        </li>
                        <li>
                            Use console.log(), console.error(), etc. to see
                            output
                        </li>
                        <li>Return values will be displayed automatically</li>
                        <li>
                            For security reasons, some browser APIs may be
                            restricted
                        </li>
                    </ul>
                ) : (
                    <ul className={styles.infoList}>
                        <li>Python code runs in the browser using Pyodide</li>
                        <li>Standard Python libraries are available</li>
                        <li>Use print() to display output</li>
                        <li>
                            First run may take a moment to load the Python
                            environment
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
}

export default CodeRunner;
