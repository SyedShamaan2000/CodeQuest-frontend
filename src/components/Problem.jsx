import React from "react";
import styles from "./../pages/CodeRunner.module.css";

/*  Controlled OR uncontrolled:                                  *
 *  • If parent passes currentIndex + setCurrentIndex → controlled
 *  • Otherwise it falls back to its own internal state           */

export default function Problem({ testData, currentIndex, setCurrentIndex }) {
    const questions = testData?.Question || [];

    /* Fallback self-managed state */
    const [internalIdx, setInternalIdx] = React.useState(0);
    const idx = currentIndex !== undefined ? currentIndex : internalIdx;
    const setIdx = setCurrentIndex || setInternalIdx;
    const question = questions[idx];

    if (!testData)
        return <div className={styles.sectionContent}>Loading problem…</div>;
    if (!questions.length)
        return (
            <div className={styles.sectionContent}>No questions available.</div>
        );

    return (
        <div className={styles.problemWrapper}>
            {/* Navigation dots */}
            <div className={styles.questionNav}>
                {questions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`${styles.questionDot} ${
                            i === idx ? styles.activeDot : ""
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Question card */}
            <div className={styles.questionCard}>
                <h3 className={styles.questionTitle}>
                    {idx + 1}. {question.name}
                </h3>

                <div className={styles.questionStatement}>
                    {question.statement}
                </div>

                <div className={styles.constraintsBox}>
                    <h4 className={styles.subTitle}>Constraints:</h4>
                    <div className={styles.constraintsText}>
                        {question.constraints}
                    </div>
                </div>

                <div className={styles.testCasesSection}>
                    <h4 className={styles.subTitle}>Test Cases:</h4>
                    <div className={styles.testCasesList}>
                        {question.testcases.map((tc, i) => (
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
