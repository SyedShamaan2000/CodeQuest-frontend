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
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";

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

function AppContent() {
    // Toast state
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    // Utility to show a toast
    const displayToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast((t) => ({ ...t, show: false }));
        }, 3000);
    };

    return (
        <>
            <Toast {...toast} />

            <Routes>
                <Route
                    path="/"
                    element={<LoginPage displayToast={displayToast} />}
                />
                <Route
                    path="/login"
                    element={<LoginPage displayToast={displayToast} />}
                />
                <Route
                    path="/register"
                    element={<RegisterPage displayToast={displayToast} />}
                />
                <Route path="/landing" element={<LandingPage />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <Router>
            <div className="app-wrapper">
                <AppWrapper />
            </div>
        </Router>
    );
}
