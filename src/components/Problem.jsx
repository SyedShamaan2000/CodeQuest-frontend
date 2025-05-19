import React, { useState, useEffect } from "react";
import styles from "./../pages/CodeRunner.module.css";

export default function Problem({ testData }) {
    // State to track which question is active
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    // Log the incoming data for debugging
    useEffect(() => {
        if (testData) {
            console.log("Problem component received data:", testData);
        }
    }, [testData]);

    // Show a loader or fallback if no data yet
    if (!testData) {
        return <div className={styles.sectionContent}>Loading problem...</div>;
    }

    // Destructure the relevant fields
    const { Question: questions = [] } = testData;

    // Handle empty questions array
    if (!questions.length) {
        return (
            <div className={styles.sectionContent}>No questions available.</div>
        );
    }

    // Make sure we don't try to access a question that doesn't exist
    const currentIndex = Math.min(activeQuestionIndex, questions.length - 1);
    const currentQuestion = questions[currentIndex];

    return (
        <div className={styles.problemWrapper}>
            {/* Question navigation dots */}
            <div className={styles.questionNav}>
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`${styles.questionDot} ${
                            idx === currentIndex ? styles.activeDot : ""
                        }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            {/* Current question display */}
            <div className={styles.questionCard}>
                <h3 className={styles.questionTitle}>
                    {currentIndex + 1}. {currentQuestion.name}
                </h3>

                <div className={styles.questionStatement}>
                    {currentQuestion.statement}
                </div>

                <div className={styles.constraintsBox}>
                    <h4 className={styles.subTitle}>Constraints:</h4>
                    <div className={styles.constraintsText}>
                        {currentQuestion.constraints}
                    </div>
                </div>

                <div className={styles.testCasesSection}>
                    <h4 className={styles.subTitle}>Test Cases:</h4>
                    <div className={styles.testCasesList}>
                        {currentQuestion.testcases.map((tc, i) => (
                            <div key={i} className={styles.testCase}>
                                <div className={styles.testCaseRow}>
                                    <span className={styles.testCaseLabel}>
                                        Input:
                                    </span>
                                    <span className={styles.testCaseValue}>
                                        {JSON.stringify(tc.input)}
                                    </span>
                                </div>
                                <div className={styles.testCaseRow}>
                                    <span className={styles.testCaseLabel}>
                                        Output:
                                    </span>
                                    <span className={styles.testCaseValue}>
                                        {JSON.stringify(tc.output)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
