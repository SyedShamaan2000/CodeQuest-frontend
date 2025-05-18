import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { registerUserApi } from "../api/base.api"; // Ensure this path and export are correct

export default function RegisterPage({ displayToast }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    async function registerUserApiFunction(requestBody) {
        return fetch(registerUserApi, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
    }

    const submit = (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            displayToast("Please fill all required fields", "error");
            return;
        }
        if (password !== confirmPassword) {
            displayToast("Passwords do not match", "error");
            return;
        }

        const [firstName, lastName] = name.split(" ");
        const requestBody = {
            firstName: firstName || "",
            lastName: lastName || "",
            email,
            password,
            passwordConfirm: confirmPassword,
        };

        registerUserApiFunction(requestBody)
            .then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        // console.log("Response data:", data);
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
                        displayToast("Account created successfully!");
                        navigate("/login");
                    });
                } else {
                    return response.json().then((errorData) => {
                        console.log("Error data:", errorData);
                        displayToast(
                            errorData.message || "Registration failed",
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
        <div className="register-page">
            <div className="visual" />
            <div className="form-panel">
                <form className="form" onSubmit={submit}>
                    <label>
                        Name *
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>
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
                    <label>
                        Confirm Password *
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
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
