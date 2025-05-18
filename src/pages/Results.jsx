import React, { useState, useEffect } from "react";
import { getResultsApi } from "../api/base.api";
import styles from "./Results.module.css";

const Results = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No token found");
                }

                const response = await fetch(getResultsApi, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.status === "success") {
                    setResults(data.data.results);
                } else {
                    throw new Error(data.message || "Failed to fetch results");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.resultsContainer}>
            <h1>Results</h1>
            <ul>
                {results.map((result) => (
                    <li key={result._id} className={styles.resultItem}>
                        <strong>Test Name</strong> {result.testName}
                        <br />
                        <strong>Test ID:</strong> {result.testID}
                        <br />
                        <strong>Candidate:</strong>{" "}
                        {result.candidate.length > 0
                            ? result.candidate.join(", ")
                            : "None"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Results;
