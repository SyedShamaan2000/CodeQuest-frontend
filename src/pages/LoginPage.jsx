import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { loginUserApi } from "../api/base.api";

export default function LoginPage({ displayToast }) {
  /* ───────── form state ───────── */
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState({}); // { field: msg }
  /* ────────────────────────────── */

  const navigate = useNavigate();

  /* ---------- validators ---------- */
  const validateEmail = (val) =>
    /^\S+@\S+\.\S+$/.test(val) ? "" : "Invalid email format";

  const validatePassword = (val) =>
    val.length >= 6 ? "" : "Password must be ≥ 6 characters";

  const runValidation = () => {
    const newErrs = {
      email:    validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrs);
    return Object.values(newErrs).some(Boolean);
  };
  /* -------------------------------- */

  async function loginUserApiFunction(body) {
    return fetch(loginUserApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  /* ---------- submit ---------- */
  const submit = (e) => {
    e.preventDefault();
    if (runValidation()) {
      displayToast("Please correct the highlighted errors", "error");
      return;
    }

    loginUserApiFunction({ email, password })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) =>
            displayToast(err.message || "Login failed", "error")
          );
        }

        res.json().then((data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userEmail", data.data.user.email);
          localStorage.setItem("userId", data.data.user._id);
          displayToast("Successfully logged in!");
          navigate("/landing");
        });
      })
      .catch((err) => {
        console.error(err);
        displayToast("An error occurred. Please try again.", "error");
      });
  };
  /* -------------------------------- */

  /* helper to update field + clear error */
  const update = (setter, validator, key) => (e) => {
    const val = e.target.value;
    setter(val);
    setErrors((p) => ({ ...p, [key]: validator(val) }));
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
              onChange={update(setEmail, validateEmail, "email")}
              className={errors.email ? "invalid" : ""}
            />
            {errors.email && <span className="err-text">{errors.email}</span>}
          </label>

          {/* Password */}
          <label>
            Password *
            <input
              type="password"
              value={password}
              onChange={update(setPassword, validatePassword, "password")}
              className={errors.password ? "invalid" : ""}
            />
            {errors.password && (
              <span className="err-text">{errors.password}</span>
            )}
          </label>

          <button className="primary-btn">SUBMIT</button>
        </form>

        <p className="switch-link" onClick={() => navigate("/register")}>
          Create New Account?
        </p>
      </div>
    </div>
  );
}
