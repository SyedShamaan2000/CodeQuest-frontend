// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Toast from "./components/Toast";
import LoginPage from "./pages/LoginPage";
import SubmittedPage from "./pages/SubmittedPage";
import CodeRunner from "./pages/CodeRunner";
import FullscreenGuard from "./components/FullscreenGuard"; // ⬅️ NEW import

/* ------------------------------------------------------------------ */
/*  Auth wrapper – kicks users back to "/" if there is no token        */
/* ------------------------------------------------------------------ */
function AppWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      localStorage.setItem("token", "token");
    }
  }, [navigate]);

  return <AppContent />;
}

/* ------------------------------------------------------------------ */
/*  Main app content – routes + toast                                 */
/* ------------------------------------------------------------------ */
function AppContent() {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const displayToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  return (
    <>
      <Toast {...toast} />

      <Routes>
        {/* ---------- Public / login route ---------- */}
        <Route path="/" element={<LoginPage displayToast={displayToast} />} />

        {/* ---------- Protected / exam routes ---------- */}
        <Route
          path="/exam"
          element={
            <FullscreenGuard>
              <CodeRunner displayToast={displayToast} />
            </FullscreenGuard>
          }
        />
        <Route
          path="/submitted"
          element={
            <FullscreenGuard>
              <SubmittedPage />
            </FullscreenGuard>
          }
        />
      </Routes>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Root component with BrowserRouter                                 */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <AppWrapper />
      </div>
    </Router>
  );
}
