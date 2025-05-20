import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { getTestApi } from "../api/base.api";

export default function LoginPage({ displayToast }) {
  /* ───────── local form state ───────── */
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [testId, setTestId] = useState("");

  const [errors, setErrors] = useState({}); // { field: message }
  /* ───────────────────────────────────── */

  const navigate = useNavigate();

  /* ---------- simple validators ---------- */
  const validateEmail = (val) =>
    /^\S+@\S+\.\S+$/.test(val) ? "" : "Invalid email address";

  const validateName = (val) =>
    val.trim().length >= 2 ? "" : "Name must be at least 2 characters";

  // our IDs are Mongo-like 24-char hex; tweak if your rule differs
  const validateTestId = (val) =>
    /^[0-9a-fA-F]{24}$/.test(val) ? "" : "Test ID must be a 24-digit hex code";

  const runValidation = () => {
    const newErrs = {
      email: validateEmail(email),
      userName: validateName(userName),
      testId: validateTestId(testId),
    };
    setErrors(newErrs);
    // return true if any error
    return Object.values(newErrs).some(Boolean);
  };
  /* -------------------------------------- */

  /* ---------- helper to GET test ---------- */
  async function fetchTest(id) {
    return fetch(`${getTestApi}/${id}`, { method: "GET" });
  }
  /* ---------------------------------------- */

  /* ---------- submit handler ---------- */
  const submit = (e) => {
    e.preventDefault();

    if (runValidation()) {
      displayToast("Please correct the highlighted errors", "error");
      return;
    }

    // clear any stale login data
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    fetchTest(testId)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            displayToast(err.message || "Login failed", "error");
          });
        }

        return res.json().then((data) => {
          const test = data?.data?.test;
          // console.log(test);
          if (!test) {
            displayToast("Invalid test data", "error");
            return;
          }

          const duration = test.duration;
          const proceed = window.confirm(
            `The test ends in ${duration} minute${
              duration === 1 ? "" : "s"
            }.\nClick OK to begin.`
          );
          if (!proceed) return;

          localStorage.setItem("token", test._id);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", userName);

          displayToast("Successfully logged in!");
          navigate("/exam", { state: { testData: test } });
        });
      })
      .catch((err) => {
        console.error(err);
        displayToast("An error occurred. Please try again.", "error");
      });
  };
  /* -------------------------------------- */

  /*  Helpers to update state and clear a field’s error when user types  */
  const handleChange = (setter, validator, key) => (e) => {
    const val = e.target.value;
    setter(val);
    setErrors((prev) => ({ ...prev, [key]: validator(val) }));
  };

  return (
    <div className="login-page">
      <div className="visual" />

      <div className="form-panel">
        <form className="form" onSubmit={submit} noValidate>
          {/* Email */}
          <label>
            Email *
            <input
              type="email"
              value={email}
              onChange={handleChange(setEmail, validateEmail, "email")}
              className={errors.email ? "invalid" : ""}
            />
            {errors.email && <span className="err-text">{errors.email}</span>}
          </label>

          {/* Name */}
          <label>
            Name *
            <input
              type="text"
              value={userName}
              onChange={handleChange(setUserName, validateName, "userName")}
              className={errors.userName ? "invalid" : ""}
            />
            {errors.userName && (
              <span className="err-text">{errors.userName}</span>
            )}
          </label>

          {/* Test ID */}
          <label>
            Test&nbsp;ID *
            <input
              type="text"
              value={testId}
              onChange={handleChange(setTestId, validateTestId, "testId")}
              className={errors.testId ? "invalid" : ""}
            />
            {errors.testId && <span className="err-text">{errors.testId}</span>}
          </label>

          <button className="primary-btn">SUBMIT</button>
        </form>
      </div>
    </div>
  );
}
