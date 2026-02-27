"use strict";

import {
  getActiveNotes,
  getArchivedNotes,
  createNote,
  removeNote,
  archiveNote as archiveNoteRequest,
  unarchiveNote as unarchiveNoteRequest,
} from "../data/notes-api.js";

const state = {
  activeNotes: [],
  archivedNotes: [],
  loading: false,
  error: "",
};

function sortByNewest(notes) {
  return [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function setLoading(value) {
  state.loading = value;
}

function setError(message) {
  state.error = message || "";
}

function getNotes() {
  return [...state.activeNotes, ...state.archivedNotes];
}

function getActiveNotesState() {
  return [...state.activeNotes];
}

function getArchivedNotesState() {
  return [...state.archivedNotes];
}

function getNoteById(id) {
  return [...state.activeNotes, ...state.archivedNotes].find((note) => note.id === id) || null;
}

function isLoading() {
  return state.loading;
}

function getError() {
  return state.error;
}

async function refreshNotes() {
  setLoading(true);
  setError("");

  try {
    const [activeResult, archivedResult] = await Promise.allSettled([
      getActiveNotes(),
      getArchivedNotes(),
    ]);

    if (activeResult.status !== "fulfilled") {
      throw activeResult.reason;
    }

    const activeNotes = Array.isArray(activeResult.value) ? activeResult.value : [];
    const archivedNotes =
      archivedResult.status === "fulfilled" && Array.isArray(archivedResult.value)
        ? archivedResult.value
        : [];

    state.activeNotes = sortByNewest(activeNotes);
    state.archivedNotes = sortByNewest(archivedNotes);
    return getNotes();
  } catch (error) {
    const message = error?.message || "Gagal memuat catatan dari server.";
    console.error("refreshNotes failed:", error);
    setError(message);
    throw new Error(message);
  } finally {
    setLoading(false);
  }
}

async function initializeState() {
  return refreshNotes();
}

async function addNote(note) {
  setLoading(true);
  setError("");

  try {
    await createNote(note);
    return await refreshNotes();
  } catch (error) {
    const message = error?.message || "Gagal menambahkan catatan.";
    setError(message);
    throw new Error(message);
  } finally {
    setLoading(false);
  }
}

async function deleteNote(id) {
  setLoading(true);
  setError("");

  try {
    await removeNote(id);
    return await refreshNotes();
  } catch (error) {
    const message = error?.message || "Gagal menghapus catatan.";
    setError(message);
    throw new Error(message);
  } finally {
    setLoading(false);
  }
}

async function archiveNote(id) {
  setLoading(true);
  setError("");

  try {
    const note = getNoteById(id);
    if (!note) {
      throw new Error("Catatan tidak ditemukan.");
    }

    if (note.archived) {
      await unarchiveNoteRequest(id);
    } else {
      await archiveNoteRequest(id);
    }

    return await refreshNotes();
  } catch (error) {
    const message = error?.message || "Gagal mengubah status arsip catatan.";
    setError(message);
    throw new Error(message);
  } finally {
    setLoading(false);
  }
}

export {
  getNotes,
  getActiveNotesState,
  getArchivedNotesState,
  getNoteById,
  isLoading,
  getError,
  addNote,
  deleteNote,
  archiveNote,
  initializeState,
  refreshNotes,
};
