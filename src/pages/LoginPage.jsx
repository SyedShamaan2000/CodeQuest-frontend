import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { getTestApi } from "../api/base.api";

export default function LoginPage({ displayToast }) {
  /* ---------- local form state ---------- */
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [testId, setTestId] = useState("");
  /* -------------------------------------- */

  const navigate = useNavigate();

  /* ---------- helper to GET test ---------- */
  async function fetchTest(id) {
    return fetch(`${getTestApi}/${id}`, { method: "GET" });
  }
  /* ---------------------------------------- */

  /* ---------- submit handler ---------- */
  const submit = (e) => {
    e.preventDefault();

    if (!email || !userName || !testId) {
      displayToast("Please fill all required fields", "error");
      return;
    }
    if (localStorage.getItem("userEmail")) {
      localStorage.removeItem("userEmail");
    }
    if (localStorage.getItem("userEmail")) {
      localStorage.removeItem("userName");
    }

    fetchTest(testId)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            displayToast(err.message || "Login failed", "error");
          });
        }

        /* ---------- successful fetch ---------- */
        return res.json().then((data) => {
          const test = data?.data?.test;
          if (!test) {
            displayToast("Invalid test data", "error");
            return;
          }

          /* 1️⃣  POP-UP with duration */
          const duration = test.duration; // minutes
          const proceed = window.confirm(
            `The test ends in ${duration} minute${
              duration === 1 ? "" : "s"
            }.\nClick OK to begin.`
          );
          if (!proceed) return; // user cancelled

          /* 2️⃣  Persist details exactly as before */
          localStorage.setItem("token", test._id);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", userName);

          /* 3️⃣  Success toast + navigate */
          displayToast("Successfully logged in!");
          navigate("/exam", { state: { testData: test } });
        });
        /* -------------------------------------- */
      })
      .catch((err) => {
        console.error(err);
        displayToast("An error occurred. Please try again.", "error");
      });
  };
  /* -------------------------------------- */

  return (
    <div className="login-page">
      <div className="visual" />
      <div className="form-panel">
        <form className="form" onSubmit={submit}>
          <label>
            Email *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Name *
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </label>

          <label>
            Test&nbsp;ID *
            <input
              type="text"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
            />
          </label>

          <button className="primary-btn">SUBMIT</button>
        </form>
      </div>
    </div>
  );
}
