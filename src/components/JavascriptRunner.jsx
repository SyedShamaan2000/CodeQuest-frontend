import React, { useState } from "react";
import styles from "./JavaScriptRunner.module.css";

function JavaScriptRunner() {
    const [code, setCode] = useState('console.log("Hello World");');
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);

    const runCode = async () => {
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
                    code +
                    " } catch(e) { console.error(e); } })()"
            );
            const result = await executeCode();

            // Restore the original console
            window.console = originalConsole;

            // If there's a return value, add it to the output
            if (result !== undefined) {
                consoleOutput.push(`Return value: ${formatOutput(result)}`);
            }

            setOutput(consoleOutput.join("\n"));
        } catch (err) {
            // Restore the original console in case of error
            if (window.console !== console) {
                window.console = console;
            }

            setError(`Execution error: ${err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    // Format different types of output for display
    const formatOutput = (value) => {
        if (value === null) return "null";
        if (value === undefined) return "undefined";
        if (typeof value === "object") {
            try {
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>JavaScript Code Runner</h1>

            <div className={styles.codeContainer}>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={styles.codeEditor}
                    placeholder="Enter JavaScript code here..."
                    disabled={isRunning}
                />

                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className={styles.runButton}
                >
                    {isRunning ? (
                        <>
                            <span className={styles.spinner}></span>
                            Running...
                        </>
                    ) : (
                        "Run JavaScript"
                    )}
                </button>
            </div>

            <div className={styles.outputSection}>
                <h2 className={styles.outputTitle}>Console Output:</h2>
                {error && (
                    <div className={styles.errorBox}>
                        <span className={styles.errorIcon}>⚠️</span> {error}
                    </div>
                )}
                <pre className={styles.outputDisplay}>
                    {output || "No output yet. Run your code to see results."}
                </pre>
            </div>

            <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>
                    About this JavaScript Runner
                </h3>
                <ul className={styles.infoList}>
                    <li>Code runs in your browser's JavaScript environment</li>
                    <li>
                        Use console.log(), console.error(), etc. to see output
                    </li>
                    <li>Return values will be displayed automatically</li>
                    <li>
                        For security reasons, some browser APIs may be
                        restricted
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default JavaScriptRunner;
