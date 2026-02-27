"use strict";

const BASE_URL = "https://notes-api.dicoding.dev/v2";
const DEFAULT_RETRY_COUNT = 2;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeError(error, response) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      message: "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.",
      retriable: true,
      status: 0,
    };
  }

  if (response) {
    return {
      message: error?.message || `Permintaan gagal (${response.status}).`,
      retriable: response.status >= 500,
      status: response.status,
    };
  }

  return {
    message: error?.message || "Terjadi kesalahan jaringan.",
    retriable: true,
    status: 0,
  };
}

async function request(path, options = {}, retryCount = DEFAULT_RETRY_COUNT) {
  let attempt = 0;

  while (attempt <= retryCount) {
    let response;

    try {
      response = await fetch(`${BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        const apiError = new Error(result.message || "Permintaan API gagal.");
        const normalized = normalizeError(apiError, response);
        if (normalized.retriable && attempt < retryCount) {
          await wait(300 * (attempt + 1));
          attempt += 1;
          continue;
        }
        throw normalized;
      }

      return result;
    } catch (error) {
      const normalized = error?.status !== undefined ? error : normalizeError(error, response);
      if (normalized.retriable && attempt < retryCount) {
        await wait(300 * (attempt + 1));
        attempt += 1;
        continue;
      }
      throw normalized;
    }
  }

  throw {
    message: "Permintaan gagal setelah beberapa percobaan.",
    retriable: false,
    status: 0,
  };
}

async function getActiveNotes() {
  const result = await request("/notes", { method: "GET" });
  return result.data || [];
}

async function getArchivedNotes() {
  const result = await request("/notes/archived", { method: "GET" });
  return result.data || [];
}

async function createNote(payload) {
  const result = await request("/notes", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      body: payload.body,
    }),
  });
  return result.data;
}

async function removeNote(id) {
  await request(`/notes/${id}`, { method: "DELETE" });
}

async function archiveNote(id) {
  await request(`/notes/${id}/archive`, { method: "POST" });
}

async function unarchiveNote(id) {
  await request(`/notes/${id}/unarchive`, { method: "POST" });
}

export {
  getActiveNotes,
  getArchivedNotes,
  createNote,
  removeNote,
  archiveNote,
  unarchiveNote,
};
