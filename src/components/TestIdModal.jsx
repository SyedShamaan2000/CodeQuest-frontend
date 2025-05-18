// TestIdModal.js
import React from "react";
import styles from "./TestIdModal.module.css";

export const TestIdModal = ({ visible, testId, onClose }) => {
    if (!visible) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(testId);
        alert("Copied to clipboard!");
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Your Test ID</h2>
                <p>{testId}</p>
                <button onClick={copyToClipboard}>Copy to Clipboard</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};
