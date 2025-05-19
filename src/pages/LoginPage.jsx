import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { getTestApi } from "../api/base.api";

export default function LoginPage({ displayToast }) {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [testId, setTestId] = useState("");
    const navigate = useNavigate();

    async function loginUserApiFunction(requestBody) {
        return fetch(`${getTestApi}/${requestBody.testId}`, {
            method: "GET",
        });
    }

    const submit = (e) => {
        e.preventDefault();
        if (!email || !userName || !testId) {
            displayToast("Please fill all required fields", "error");
            return;
        }

        const requestBody = { email, userName, testId };

        loginUserApiFunction(requestBody)
            .then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        console.log("Response data:", data);
                        const testId = data.data.test._id;
                        // console.log(testId);
                        // console.log(data.data.test);

                        const fetchedTestData = data.data.test;

                        if (testId) {
                            if (localStorage.getItem("token")) {
                                localStorage.removeItem("token");
                            }
                            localStorage.setItem("token", testId);
                            if (localStorage.getItem("userEmail")) {
                                localStorage.removeItem("userEmail");
                            }
                            localStorage.setItem("userEmail", email);
                            if (localStorage.getItem("userName")) {
                                localStorage.removeItem("userName");
                            }
                            localStorage.setItem("userName", userName);
                        }
                        displayToast("Successfully logged in!");
                        navigate("/exam", {
                            state: { testData: fetchedTestData },
                        });
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
                        Name *
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </label>
                    <label>
                        Test ID *
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
