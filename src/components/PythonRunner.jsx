import React, { useEffect, useState } from "react";
import styles from "./PythonRunner.module.css";

function PythonRunner() {
    const [output, setOutput] = useState("");
    const [pyodide, setPyodide] = useState(null);
    const [code, setCode] = useState('print("Hello World")');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    // Load Pyodide when component mounts
    useEffect(() => {
        async function loadPyodide() {
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

                setOutput("Loading Pyodide environment...");
                // Now load Pyodide itself
                const pyodideInstance = await window.loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
                });

                setPyodide(pyodideInstance);
                setOutput(
                    "Pyodide loaded successfully! Ready to run Python code."
                );
                setLoading(false);
            } catch (error) {
                console.error("Failed to load Pyodide:", error);
                setError(`Failed to load Pyodide: ${error.message}`);
                setLoading(false);
            }
        }

        loadPyodide();

        // Cleanup function
        return () => {
            // Clean up if needed
        };
    }, []);

    const runCode = async () => {
        if (!pyodide) {
            setOutput("Pyodide is not loaded yet. Please wait.");
            return;
        }

        try {
            setIsRunning(true);
            setOutput("Running code...");

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
                exec("""${code.replace(/"""/g, '\\"\\"\\"')}""")
                result = output.get_output()
            except Exception as e:
                result = str(e)
        result
      `);

            setOutput(result || "Code executed successfully (no output)");
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Python Code Runner</h1>

            {error ? (
                <div className={`${styles.statusBox} ${styles.errorStatus}`}>
                    <span className={styles.statusIcon}>⚠️</span> {error}
                </div>
            ) : loading ? (
                <div className={`${styles.statusBox} ${styles.loadingStatus}`}>
                    <span className={styles.statusIcon}>⏳</span> Loading
                    Pyodide environment... This may take a moment.
                </div>
            ) : (
                <div className={`${styles.statusBox} ${styles.successStatus}`}>
                    <span className={styles.statusIcon}>✓</span> Pyodide loaded
                    successfully!
                </div>
            )}

            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={styles.codeEditor}
                placeholder="Enter Python code here..."
                disabled={loading || error}
            />

            <button
                onClick={runCode}
                disabled={loading || error || isRunning}
                className={styles.runButton}
            >
                {isRunning ? (
                    <>
                        <span className={styles.spinner}></span>
                        Running...
                    </>
                ) : loading ? (
                    "Loading..."
                ) : (
                    "Run Python"
                )}
            </button>

            <div className={styles.outputSection}>
                <h2 className={styles.outputTitle}>Output:</h2>
                <pre className={styles.outputDisplay}>
                    {output || "No output yet."}
                </pre>
            </div>
        </div>
    );
}

export default PythonRunner;
