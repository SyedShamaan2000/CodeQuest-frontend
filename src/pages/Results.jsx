// import React, { useState, useEffect } from "react";
// import { getResultsApi } from "../api/base.api";
// import styles from "./Results.module.css";

// const Results = () => {
//     const [results, setResults] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchResults = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 if (!token) {
//                     throw new Error("No token found");
//                 }

//                 const response = await fetch(getResultsApi, {
//                     method: "GET",
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 });

//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }

//                 const data = await response.json();
//                 if (data.status === "success") {
//                     setResults(data.data.results);
//                 } else {
//                     throw new Error(data.message || "Failed to fetch results");
//                 }
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchResults();
//     }, []);

//     if (loading) return <div className={styles.loading}>Loading...</div>;
//     if (error) return <div className={styles.error}>Error: {error}</div>;

//     return (
//         <div className={styles.resultsContainer}>
//             <h1>Results</h1>
//             <ul>
//                 {results.map((result) => (
//                     <li key={result._id} className={styles.resultItem}>
//                         <strong>Test Name</strong> {result.testName}
//                         <br />
//                         <strong>Test ID:</strong> {result.testID}
//                         <br />
//                         <strong>Candidate:</strong>{" "}
//                         {result.candidate.length > 0
//                             ? result.candidate.join(", ")
//                             : "None"}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default Results;
// Results.js
import React, { useState, useEffect } from "react";
import { getResultsApi } from "../api/base.api";
import styles from "./Results.module.css";

const Results = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("testName");
    const [sortOrder, setSortOrder] = useState("asc");

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

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleSort = (criteria) => {
        if (sortBy === criteria) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(criteria);
            setSortOrder("asc");
        }
    };

    const getSortedResults = () => {
        if (!results.length) return [];

        return [...results]
            .filter(
                (result) =>
                    result.testName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    result.testID
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortBy === "testName") {
                    const comparison = a.testName.localeCompare(b.testName);
                    return sortOrder === "asc" ? comparison : -comparison;
                } else if (sortBy === "candidates") {
                    const aCount = a.candidate?.length || 0;
                    const bCount = b.candidate?.length || 0;
                    return sortOrder === "asc"
                        ? aCount - bCount
                        : bCount - aCount;
                }
                return 0;
            });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>!</div>
                <h2>Error</h2>
                <p>{error}</p>
                <button
                    className={styles.retryButton}
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    const sortedResults = getSortedResults();

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.resultsContainer}>
                <div className={styles.header}>
                    <h1>Test Results</h1>
                    <p className={styles.subtitle}>
                        View and manage all assessment results
                    </p>
                </div>

                <div className={styles.controls}>
                    <div className={styles.search}>
                        <input
                            type="text"
                            placeholder="Search by test name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <span className={styles.searchIcon}>🔍</span>
                    </div>
                    <div className={styles.sortControls}>
                        <span>Sort by:</span>
                        <button
                            className={`${styles.sortButton} ${
                                sortBy === "testName" ? styles.active : ""
                            }`}
                            onClick={() => handleSort("testName")}
                        >
                            Test Name{" "}
                            {sortBy === "testName" &&
                                (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                        <button
                            className={`${styles.sortButton} ${
                                sortBy === "candidates" ? styles.active : ""
                            }`}
                            onClick={() => handleSort("candidates")}
                        >
                            Candidates{" "}
                            {sortBy === "candidates" &&
                                (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                    </div>
                </div>

                {sortedResults.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📋</div>
                        <h3>No results found</h3>
                        <p>
                            There are no test results matching your search
                            criteria.
                        </p>
                    </div>
                ) : (
                    <div className={styles.cardsGrid}>
                        {sortedResults.map((result) => (
                            <div
                                key={result._id}
                                className={`${styles.card} ${
                                    expandedId === result._id
                                        ? styles.expanded
                                        : ""
                                }`}
                                onClick={() => toggleExpand(result._id)}
                            >
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.cardTitle}>
                                        {result.testName}
                                    </h2>
                                    <span className={styles.expandIcon}>
                                        {expandedId === result._id ? "−" : "+"}
                                    </span>
                                </div>
                                <div className={styles.cardMeta}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaIcon}>
                                            🆔
                                        </span>
                                        <span>{result.testID}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaIcon}>
                                            👥
                                        </span>
                                        <span>
                                            {result.candidate?.length || 0}{" "}
                                            Candidates
                                        </span>
                                    </div>
                                </div>

                                {expandedId === result._id && (
                                    <div className={styles.candidatesList}>
                                        <h3>Candidate Results</h3>
                                        {result.candidate?.length ? (
                                            <table
                                                className={
                                                    styles.candidatesTable
                                                }
                                            >
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.candidate.map(
                                                        (c) => (
                                                            <tr key={c._id}>
                                                                <td>
                                                                    {c.name}
                                                                </td>
                                                                <td>
                                                                    {c.email}
                                                                </td>
                                                                <td>
                                                                    <div
                                                                        className={
                                                                            styles.scoreWrapper
                                                                        }
                                                                    >
                                                                        <div
                                                                            className={
                                                                                styles.scoreBar
                                                                            }
                                                                            style={{
                                                                                width: `${Math.min(
                                                                                    100,
                                                                                    Math.max(
                                                                                        0,
                                                                                        c.score
                                                                                    )
                                                                                )}%`,
                                                                                backgroundColor:
                                                                                    c.score >
                                                                                    70
                                                                                        ? "#4CAF50"
                                                                                        : c.score >
                                                                                          40
                                                                                        ? "#FFC107"
                                                                                        : "#F44336",
                                                                            }}
                                                                        ></div>
                                                                        <span
                                                                            className={
                                                                                styles.scoreText
                                                                            }
                                                                        >
                                                                            {
                                                                                c.score
                                                                            }
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div
                                                className={styles.noCandidates}
                                            >
                                                <p>
                                                    No candidates have taken
                                                    this test yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
