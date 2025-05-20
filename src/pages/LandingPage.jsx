import React, { useState, useEffect } from "react";
import validator from "validator";
import TestCaseModal from "../components/TestCaseModal";
import "./LandingPage.css";
import { createTestApi } from "../api/base.api";
import { format, parseISO } from "date-fns";
import { TestIdModal } from "../components/TestIdModal";
import Results from "./Results";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [test, setTest] = useState({
    name: "",
    company: "",
    email: "",
    duration: "",
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    Question: [
      {
        id: 1,
        name: "",
        statement: "",
        constraints: "",
        testcases: [],
        predefinedStructure: "",
      },
    ],
  });
  const [userName, setUserName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [activeQId, setActiveQId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTestIdModal, setShowTestIdModal] = useState(false);
  const [testId, setTestId] = useState(null);
  const navigate = useNavigate();

  // Extract prefix of email and set email in test state
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    setUserName(email.split("@")[0] || "User");
    setTest((t) => ({ ...t, email }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "duration" && value && parseInt(value, 10) <= 0) {
      return;
    }
    setTest((t) => ({ ...t, [name]: value }));
  };

  const handleQChange = (e, id) => {
    const { name, value } = e.target;
    setTest((t) => ({
      ...t,
      Question: t.Question.map((q) =>
        q.id === id ? { ...q, [name]: value } : q
      ),
    }));
  };

  const addQuestion = () =>
    setTest((t) => ({
      ...t,
      Question: [
        ...t.Question,
        {
          id: t.Question.length + 1,
          name: "",
          statement: "",
          constraints: "",
          predefinedStructure: "",
          testcases: [],
        },
      ],
    }));

  const openModal = (id) => {
    setActiveQId(id);
    setModalVisible(true);
  };

  const saveCases = (rows) => {
    setTest((t) => ({
      ...t,
      Question: t.Question.map((q) =>
        q.id === activeQId ? { ...q, testcases: rows } : q
      ),
    }));
    setModalVisible(false);
  };

  const deleteQuestion = (id) =>
    setTest((t) => ({
      ...t,
      Question: t.Question.filter((q) => q.id !== id),
    }));

  const canSubmit =
    test.name.trim() &&
    test.company.trim() &&
    test.email &&
    validator.isEmail(test.email) &&
    test.duration.trim() &&
    parseInt(test.duration, 10) > 0 &&
    test.startTime &&
    test.Question.length > 0 &&
    test.Question.every(
      (q) =>
        q.predefinedStructure &&
        q.name.trim() &&
        q.statement.trim() &&
        q.constraints.trim() &&
        q.testcases.length > 0 &&
        q.testcases.every((tc) => tc.input?.length > 0 && tc.output?.length > 0)
    );

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const testData = {
      ...test,
      createdBy: userId,
      startTime: new Date(test.startTime).toISOString(),
      endTime: new Date(test.endTime).toISOString(),
      duration: parseInt(test.duration, 10),
    };
    console.log(testData);
    try {
      const response = await fetch(createTestApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
      });
      if (response.status === 204) {
        alert("Test created successfully (No Content)!");
      } else if (response.status === 201) {
        const result = await response.json();
        console.log("Test created successfully:", result.data.test._id);
        setTestId(result.data.test._id); // Set the test ID
        setShowTestIdModal(true); // Show the modal
      } else if (!response.ok) {
        throw new Error("Failed to create test");
      }
      setTest({
        name: "",
        company: "",
        email: test.email,
        duration: "",
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        Question: [
          {
            id: 1,
            name: "",
            statement: "",
            constraints: "",
            testcases: [],
            predefinedStructure: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error creating test:", error);
      alert("Failed to create test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <button onClick={() => navigate("/results")} className="blue">
        Results
      </button>
      <TestIdModal
        visible={showTestIdModal}
        testId={testId}
        onClose={() => setShowTestIdModal(false)}
      />
      <h1>Welcome, {userName}</h1>
      <div className="test-card">
        <h2>Create Test</h2>
        <label>
          Test Name<span className="required">*</span>
          <input
            name="name"
            value={test.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Company Name<span className="required">*</span>
          <input
            name="company"
            value={test.company}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email<span className="required">*</span>
          <input
            name="email"
            value={test.email}
            onChange={handleChange}
            required
            disabled
          />
        </label>
        <label>
          Duration (min)<span className="required">*</span>
          <input
            type="number"
            name="duration"
            placeholder="Enter in minutes"
            value={test.duration}
            onChange={handleChange}
            min="1"
            required
          />
        </label>
        <div className="time-grid">
          <label>
            Start Time<span className="required">*</span>
            <input
              type="datetime-local"
              name="startTime"
              value={test.startTime}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            End Time<span className="required">*</span>
            <input
              type="datetime-local"
              name="endTime"
              value={test.endTime}
              onChange={handleChange}
              required
            />
          </label>
        </div>
      </div>
      {test.Question.map((q) => (
        <div key={q.id} className="question-card">
          <h3>Question No: {q.id}</h3>
          <label>
            Question Name<span className="required">*</span>
            <input
              name="name"
              value={q.name}
              onChange={(e) => handleQChange(e, q.id)}
              required
            />
          </label>
          <label>
            Statement<span className="required">*</span>
            <textarea
              name="statement"
              rows="3"
              value={q.statement}
              onChange={(e) => handleQChange(e, q.id)}
              required
            />
          </label>
          <label>
            Constraints<span className="required">*</span>
            <textarea
              name="constraints"
              rows="3"
              value={q.constraints}
              onChange={(e) => handleQChange(e, q.id)}
              required
            />
          </label>
          <label>
            Predefined Structure<span className="required">*</span>
            <textarea
              name="predefinedStructure"
              rows="5"
              value={q.predefinedStructure}
              onChange={(e) => handleQChange(e, q.id)}
              required
            />
          </label>
          <div className="btn-row">
            <button className="blue" onClick={() => openModal(q.id)}>
              + ADD TEST CASES
            </button>
            <button className="red" onClick={() => deleteQuestion(q.id)}>
              DELETE
            </button>
          </div>
        </div>
      ))}
      <div className="btn-row">
        <button className="blue" onClick={addQuestion}>
          ADD QUESTION
        </button>
        <button className="green" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? "SUBMITTING....." : "SUBMIT"}
        </button>
      </div>
      <TestCaseModal
        visible={modalVisible}
        initialCases={
          test.Question.find((q) => q.id === activeQId)?.testcases || []
        }
        onSave={saveCases}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
}
