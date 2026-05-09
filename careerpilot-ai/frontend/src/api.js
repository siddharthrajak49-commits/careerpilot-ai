// src/api.js

import BASE_URL from "./config";

export const api = async (endpoint, method = "GET", data = null, token = null) => {
  try {
    const headers = {};

    // =========================
    // CONTENT TYPE
    // =========================

    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // =========================
    // TOKEN
    // =========================

    const authToken = token || localStorage.getItem("token");

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    // =========================
    // TIMEOUT
    // =========================

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 120000);

    // =========================
    // REQUEST
    // =========================

    const res = await fetch(
      `${BASE_URL}${endpoint}`,

      {
        method,
        headers,

        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : null,

        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    // =========================
    // RESPONSE PARSE
    // =========================

    let result = {};

    try {
      result = await res.json();
    } catch {
      result = {
        detail: "Invalid server response",
      };
    }

    // =========================
    // TOKEN EXPIRED
    // =========================

    if (
      res.status === 401 ||
      result?.detail === "Invalid token" ||
      result?.detail === "Token missing"
    ) {
      // CLEAR SESSION

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("avatar");
      localStorage.removeItem("plan");

      // SYNC ALL TABS

      window.dispatchEvent(new Event("storage"));

      // REDIRECT LOGIN

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }

      return {
        detail: "Session expired",
      };
    }

    // =========================
    // NORMAL ERROR
    // =========================

    if (!res.ok) {
      // AUTH FAIL

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("email");
        localStorage.removeItem("avatar");
        localStorage.removeItem("plan");

        // prevent redirect loop

        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }

      return {
        detail: result?.detail || result?.message || "Request failed",
      };
    }

    // =========================
    // SUCCESS
    // =========================

    return result;
  } catch (err) {
    // =========================
    // TIMEOUT
    // =========================

    if (err.name === "AbortError") {
      return {
        detail: "Request timeout",
      };
    }

    console.error("API ERROR:", err);

    return {
      detail: navigator.onLine ? "Server unavailable" : "No internet connection",
    };
  }
};
