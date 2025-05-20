import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { registerUserApi } from "../api/base.api";

export default function RegisterPage({ displayToast }) {
  /* ───────── local form state ───────── */
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors,          setErrors]          = useState({}); // { field: msg }
  /* ───────────────────────────────────── */

  const navigate = useNavigate();

  /* ---------- field validators ---------- */
  const validateName = (val) =>
    val.trim().split(" ").length >= 2
      ? ""
      : "Enter first and last name";

  const validateEmail = (val) =>
    /^\S+@\S+\.\S+$/.test(val) ? "" : "Invalid email format";

  const validatePassword = (val) =>
    val.length >= 6 ? "" : "Password must be ≥ 6 characters";

  const validateConfirm = (pwd, conf) =>
    pwd === conf ? "" : "Passwords do not match";

  const runValidation = () => {
    const newErrs = {
      name:            validateName(name),
      email:           validateEmail(email),
      password:        validatePassword(password),
      confirmPassword: validateConfirm(password, confirmPassword),
    };
    setErrors(newErrs);
    return Object.values(newErrs).some(Boolean); // true if any error
  };
  /* -------------------------------------- */

  async function registerUserApiFunction(body) {
    return fetch(registerUserApi, {
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

    const [firstName, ...rest] = name.trim().split(" ");
    const requestBody = {
      firstName,
      lastName: rest.join(" "),
      email,
      password,
      passwordConfirm: confirmPassword,
    };

    registerUserApiFunction(requestBody)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            displayToast(err.message || "Registration failed", "error");
          });
        }

        res.json().then((data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userEmail", data.data.user.email);
          localStorage.setItem("userId", data.data.user._id);
          displayToast("Account created successfully!");
          navigate("/login");
        });
      })
      .catch((err) => {
        console.error(err);
        displayToast("An error occurred. Please try again.", "error");
      });
  };
  /* -------------------------------------- */

  /* helper to update field + clear its error */
  const update = (setter, validator, key, extra = null) => (e) => {
    const val = e.target.value;
    setter(val);
    setErrors((p) => ({
      ...p,
      [key]: validator(extra ?? val, extra ? val : undefined),
    }));
  };

  return (
    <div className="register-page">
      <div className="visual" />

      <div className="form-panel">
        <form className="form" onSubmit={submit} noValidate>
          {/* Name */}
          <label>
            Name *
            <input
              type="text"
              value={name}
              onChange={update(setName, validateName, "name")}
              className={errors.name ? "invalid" : ""}
            />
            {errors.name && <span className="err-text">{errors.name}</span>}
          </label>

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

          {/* Confirm password */}
          <label>
            Confirm Password *
            <input
              type="password"
              value={confirmPassword}
              onChange={update(
                setConfirmPassword,
                () => validateConfirm(password, confirmPassword),
                "confirmPassword"
              )}
              className={errors.confirmPassword ? "invalid" : ""}
            />
            {errors.confirmPassword && (
              <span className="err-text">{errors.confirmPassword}</span>
            )}
          </label>

          <button className="primary-btn">SUBMIT</button>
        </form>

        <p className="switch-link" onClick={() => navigate("/login")}>
          Already have an account?
        </p>
      </div>
    </div>
  );
}
