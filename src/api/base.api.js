import React from "react";

const baseAPI = import.meta.env.VITE_APP_API_URL || "http://127.0.0.1:5000";

export const getTestApi = `${baseAPI}/tests/startTest`;
export const executeCodeApi = `${baseAPI}/tests/execute`;
