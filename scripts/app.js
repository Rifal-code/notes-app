"use strict";

import {
  getNotes,
  addNote,
  deleteNote,
  archiveNote,
  initializeState,
} from "./data.js";

import { formatDate } from "./utils/helpers.js";

import "./components/app-bar.js";
import "./components/note-form.js";
import "./components/note-item.js";
import "./components/note-list.js";
import "./components/empty-state.js";

class App {
  constructor() {
    this.noteList = document.querySelector("note-list");
    this.initializeApp();
  }

  initializeApp() {
    initializeState();
    this.renderNotes();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("note:add", (e) => {
      this.handleAddNote(e.detail);
    });

    document.addEventListener("note:delete", (e) => {
      this.handleDeleteNote(e.detail);
    });

    document.addEventListener("note:archive", (e) => {
      this.handleArchiveNote(e.detail);
    });
  }

  handleAddNote(noteData) {
    addNote(noteData);
    this.renderNotes();
  }

  handleDeleteNote(noteData) {
    deleteNote(noteData.id);
    this.renderNotes();
  }

  handleArchiveNote(noteData) {
    archiveNote(noteData.id);
    this.renderNotes();
  }

  renderNotes() {
    const notes = getNotes();
    this.noteList.notes = notes;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
