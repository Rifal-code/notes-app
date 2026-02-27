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
  notes: [],
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
  return [...state.notes];
}

function getNoteById(id) {
  return state.notes.find((note) => note.id === id) || null;
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
    const [activeNotes, archivedNotes] = await Promise.all([
      getActiveNotes(),
      getArchivedNotes(),
    ]);

    state.notes = sortByNewest([...activeNotes, ...archivedNotes]);
    return getNotes();
  } catch (error) {
    const message = error?.message || "Gagal memuat catatan dari server.";
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
  getNoteById,
  isLoading,
  getError,
  addNote,
  deleteNote,
  archiveNote,
  initializeState,
  refreshNotes,
};
