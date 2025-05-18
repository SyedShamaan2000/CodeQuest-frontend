import React from "react";

const baseAPI = import.meta.env.VITE_APP_API_URL || "http://127.0.0.1:5001";

export const registerUserApi = `${baseAPI}/users/signup`;
export const loginUserApi = `${baseAPI}/users/login`;
export const createTestApi = `${baseAPI}/tests`;
export const getResultsApi = `${baseAPI}/results/myResults`;
