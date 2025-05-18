import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { loginUserApi } from "../api/base.api"; // Ensure this path and export are correct

export default function LoginPage({ displayToast }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function loginUserApiFunction(requestBody) {
        return fetch(loginUserApi, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
    }

    const submit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            displayToast("Please fill all required fields", "error");
            return;
        }

        const requestBody = { email, password };

        loginUserApiFunction(requestBody)
            .then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        console.log("Response data:", data);
                        if (data.token) {
                            if (localStorage.getItem("token")) {
                                localStorage.removeItem("token");
                            }
                            localStorage.setItem("token", data.token);
                            if (localStorage.getItem("userEmail")) {
                                localStorage.removeItem("userEmail");
                            }
                            localStorage.setItem(
                                "userEmail",
                                data.data.user.email
                            );
                            if (localStorage.getItem("userId")) {
                                localStorage.removeItem("userId");
                            }
                            localStorage.setItem("userId", data.data.user._id);
                        }
                        displayToast("Successfully logged in!");
                        navigate("/landing");
                    });
                } else {
                    return response.json().then((errorData) => {
                        console.log("Error data:", errorData);
                        displayToast(
                            errorData.message || "Login failed",
                            "error"
                        );
                    });
                }
            })
            .catch((error) => {
                console.log("Error occurred:", error);
                displayToast("An error occurred. Please try again.", "error");
            });
    };

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
                        Password *
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <button className="primary-btn">SUBMIT</button>
                </form>
                <p
                    className="switch-link"
                    onClick={() => navigate("/register")}
                >
                    Create New Account?
                </p>
            </div>
        </div>
    );
}
