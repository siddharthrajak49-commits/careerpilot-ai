// src/api.js

import BASE_URL from "./config";

export const api = async (
  endpoint,
  method = "GET",
  data = null,
  token = null
) => {
  try {

    const headers = {};

    /* =========================
       CONTENT TYPE
    ========================= */

    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    /* =========================
       AUTH TOKEN
    ========================= */

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    /* =========================
       TIMEOUT CONTROLLER
    ========================= */

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000); // 15 sec

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: data
        ? data instanceof FormData
          ? data
          : JSON.stringify(data)
        : null,
      signal: controller.signal
    });

    clearTimeout(timeout);

    /* =========================
       SAFE PARSE
    ========================= */

    let result;

    try {
      result = await res.json();
    } catch {
      result = {
        error: "Invalid server response"
      };
    }

    /* =========================
       ERROR HANDLE
    ========================= */

    if (!res.ok) {

      return {
        error:
          result?.detail ||
          result?.message ||
          "Request failed"
      };

    }

    return result;

  } catch (err) {

    /* =========================
       NETWORK ERROR
    ========================= */

    if (err.name === "AbortError") {
      return { error: "Request timeout" };
    }

    console.error("API ERROR:", err);

    return {
      error: "Network error"
    };
  }
};