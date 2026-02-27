"use strict";

import "../styles/main.css";

import {
  getActiveNotesState,
  getArchivedNotesState,
  addNote,
  deleteNote,
  archiveNote,
  initializeState,
} from "./data.js";

import "./components/app-bar.js";
import "./components/note-form.js";
import "./components/note-item.js";
import "./components/note-list.js";
import "./components/empty-state.js";

class App {
  constructor() {
    this.noteList = document.querySelector("note-list");
    this.noteForm = document.querySelector("note-form");
    this._eventsBound = false;
    this.initializeApp();
  }

  async initializeApp() {
    if (!this._eventsBound) {
      this.setupEventListeners();
      this._eventsBound = true;
    }

    this.noteList.setLoading(true, "initial");
    this.noteList.setError("");

    try {
      await initializeState();
      this.renderNotes("initial");
    } catch (error) {
      this.noteList.setError(error.message || "Gagal memuat catatan.");
    } finally {
      this.noteList.setLoading(false, "initial");
    }
  }

  setupEventListeners() {
    document.addEventListener("note:add", (e) => {
      void this.handleAddNote(e.detail);
    });

    document.addEventListener("note:delete", (e) => {
      void this.handleDeleteNote(e.detail);
    });

    document.addEventListener("note:archive", (e) => {
      void this.handleArchiveNote(e.detail);
    });

    document.addEventListener("note:retry", () => {
      void this.initializeApp();
    });
  }

  async handleAddNote(noteData) {
    this.noteForm.setSubmitting(true);
    this.noteList.setLoading(true, "action");
    this.noteList.setError("");

    try {
      await addNote(noteData);
      this.noteForm.notifyAddSuccess();
      this.renderNotes("add");
    } catch (error) {
      this.noteList.setError(error.message || "Gagal menambahkan catatan.");
    } finally {
      this.noteList.setLoading(false, "action");
      this.noteForm.setSubmitting(false);
    }
  }

  async handleDeleteNote(noteData) {
    this.noteList.setItemBusy(noteData.id, true);
    this.noteList.setLoading(true, "action");
    this.noteList.setError("");

    try {
      await deleteNote(noteData.id);
      this.renderNotes("delete", noteData.id);
    } catch (error) {
      this.noteList.setError(error.message || "Gagal menghapus catatan.");
    } finally {
      this.noteList.setLoading(false, "action");
      this.noteList.setItemBusy(noteData.id, false);
    }
  }

  async handleArchiveNote(noteData) {
    this.noteList.setItemBusy(noteData.id, true);
    this.noteList.setLoading(true, "action");
    this.noteList.setError("");

    try {
      await archiveNote(noteData.id);
      this.renderNotes("archive", noteData.id);
    } catch (error) {
      this.noteList.setError(error.message || "Gagal mengubah arsip catatan.");
    } finally {
      this.noteList.setLoading(false, "action");
      this.noteList.setItemBusy(noteData.id, false);
    }
  }

  renderNotes(action = "initial", noteId = null) {
    const activeNotes = getActiveNotesState();
    const archivedNotes = getArchivedNotesState();
    this.noteList.setNotes(activeNotes, archivedNotes);

    requestAnimationFrame(() => {
      this.noteList.animate(action, noteId);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
