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

    // CONTENT TYPE
    if (!(data instanceof FormData)) {
      headers["Content-Type"] =
        "application/json";
    }

    // TOKEN
    if (token) {
      headers["Authorization"] =
        `Bearer ${token}`;
    }

    // TIMEOUT
    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 15000);

    const res = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        method,
        headers,
        body: data
          ? data instanceof FormData
            ? data
            : JSON.stringify(data)
          : null,
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    let result;

    try {

      result = await res.json();

    } catch {

      result = {
        detail:
          "Invalid server response"
      };

    }

    // ERROR HANDLE
    if (!res.ok) {

      return {
        detail:
          result?.detail ||
          result?.message ||
          "Request failed"
      };

    }

    return result;

  } catch (err) {

    if (err.name === "AbortError") {

      return {
        detail: "Request timeout"
      };

    }

    console.error(
      "API ERROR:",
      err
    );

    return {
      detail: "Network error"
    };

  }

};