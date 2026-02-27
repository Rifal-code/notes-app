"use strict";

import { gsap } from "gsap";

class NoteList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._activeNotes = [];
    this._archivedNotes = [];
    this._isLoading = false;
    this._loadingType = "action";
    this._error = "";
  }

  connectedCallback() {
    this.render();
    this.renderNotes();
  }

  get notes() {
    return [...this._activeNotes, ...this._archivedNotes];
  }

  set notes(value) {
    this._activeNotes = Array.isArray(value)
      ? value.filter((note) => !note.archived)
      : [];
    this._archivedNotes = Array.isArray(value)
      ? value.filter((note) => note.archived)
      : [];
    this.renderNotes();
  }

  setNotes(activeNotes, archivedNotes) {
    this._activeNotes = Array.isArray(activeNotes) ? activeNotes : [];
    this._archivedNotes = Array.isArray(archivedNotes) ? archivedNotes : [];
    this.renderNotes();
  }

  setLoading(value, type = "action") {
    this._isLoading = Boolean(value);
    this._loadingType = type === "initial" ? "initial" : "action";
    this.renderNotes();
  }

  setError(message) {
    this._error = message || "";
    this.renderNotes();
  }

  setItemBusy(noteId, isBusy) {
    const item = this.shadowRoot.querySelector(
      `note-item[data-id="${noteId}"]`,
    );
    if (!item) {
      return;
    }

    if (isBusy) {
      item.setAttribute("busy", "");
    } else {
      item.removeAttribute("busy");
    }
  }

  animate(action = "initial", noteId = null) {
    const items = this.shadowRoot.querySelectorAll("note-item");
    if (!items.length) {
      return;
    }

    if (action === "initial" || action === "delete") {
      gsap.fromTo(
        items,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" },
      );
      return;
    }

    if (action === "add") {
      const firstItem = items[0];
      gsap.fromTo(
        firstItem,
        { opacity: 0, y: -18, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" },
      );
      return;
    }

    if (action === "archive" && noteId) {
      const target = this.shadowRoot.querySelector(
        `note-item[data-id="${noteId}"]`,
      );
      if (!target) {
        return;
      }

      gsap.fromTo(
        target,
        { scale: 0.98, opacity: 0.65 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" },
      );
    }
  }

  dispatchRetryEvent() {
    const event = new CustomEvent("note:retry", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    const template = `
            <style>
                :host {
                    display: block;
                }
                .notes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }
                .notes-section {
                    padding: var(--spacing-md, 16px);
                    margin-bottom: var(--spacing-lg, 24px);
                }
                .section-title {
                    margin: 0 0 var(--spacing-sm, 8px) 0;
                    font-size: 1.1rem;
                    color: var(--text-primary, #212529);
                }
                .global-loader {
                    margin-bottom: var(--spacing-md, 16px);
                    padding: 10px 12px;
                    border-radius: var(--border-radius-sm, 4px);
                    background: #e9f2ff;
                    color: #0b3d91;
                    border: 1px solid #cfe2ff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .loader-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: currentColor;
                    animation: pulse 1s ease-in-out infinite;
                }
                .error-box {
                    margin-bottom: var(--spacing-md, 16px);
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    border-radius: var(--border-radius-sm, 4px);
                    background: #f8d7da;
                    color: #842029;
                    border: 1px solid #f5c2c7;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--spacing-sm, 8px);
                    font-size: 0.9rem;
                }
                .retry-btn {
                    padding: 6px 10px;
                    border-radius: var(--border-radius-sm, 4px);
                    border: none;
                    background: #842029;
                    color: white;
                    font-size: 0.8rem;
                }
                .skeleton-card {
                    height: 170px;
                    border-radius: var(--border-radius, 8px);
                    background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.1s linear infinite;
                }
                .empty-container {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 32px;
                }
                .empty-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .empty-desc {
                    color: #6c757d;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.45; transform: scale(0.85); }
                }
                @media (max-width: 600px) {
                    .notes-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            <div id="global-loader"></div>
            <div id="error-wrap"></div>
            <section class="notes-section">
              <h2 class="section-title">Active Notes</h2>
              <div class="notes-grid" id="active-notes-grid"></div>
            </section>
            <section class="notes-section">
              <h2 class="section-title">Archived Notes</h2>
              <div class="notes-grid" id="archived-notes-grid"></div>
            </section>
        `;
    this.shadowRoot.innerHTML = template;
  }

  renderNotes() {
    const loaderWrap = this.shadowRoot.getElementById("global-loader");
    const activeGrid = this.shadowRoot.getElementById("active-notes-grid");
    const archivedGrid = this.shadowRoot.getElementById("archived-notes-grid");
    const errorWrap = this.shadowRoot.getElementById("error-wrap");
    if (!loaderWrap || !activeGrid || !archivedGrid || !errorWrap) {
      return;
    }

    loaderWrap.innerHTML = "";
    activeGrid.innerHTML = "";
    archivedGrid.innerHTML = "";
    errorWrap.innerHTML = "";

    if (this._error) {
      const errorBox = document.createElement("div");
      errorBox.className = "error-box";
      errorBox.innerHTML = `
        <span>${this._error}</span>
        <button class="retry-btn" type="button">Coba Lagi</button>
      `;
      const retryBtn = errorBox.querySelector(".retry-btn");
      retryBtn.addEventListener("click", () => this.dispatchRetryEvent());
      errorWrap.appendChild(errorBox);
    }

    if (this._isLoading) {
      const loadingLabel =
        this._loadingType === "initial"
          ? "Memuat catatan..."
          : "Memproses perubahan...";
      loaderWrap.innerHTML = `
        <div class="global-loader" role="status" aria-live="polite">
          <span class="loader-dot" aria-hidden="true"></span>
          <span>${loadingLabel}</span>
        </div>
      `;

      for (let i = 0; i < 6; i += 1) {
        const skeletonActive = document.createElement("div");
        skeletonActive.className = "skeleton-card";
        activeGrid.appendChild(skeletonActive);

        const skeletonArchived = document.createElement("div");
        skeletonArchived.className = "skeleton-card";
        archivedGrid.appendChild(skeletonArchived);
      }
      return;
    }

    if (this._activeNotes.length === 0) {
      activeGrid.innerHTML = `
        <div class="empty-container">
            <h3 class="empty-title">Belum Ada Catatan Aktif</h3>
            <p class="empty-desc">Tambahkan catatan pertama Anda.</p>
        </div>
      `;
    }

    if (this._archivedNotes.length === 0) {
      archivedGrid.innerHTML = `
        <div class="empty-container">
            <h3 class="empty-title">Belum Ada Catatan Arsip</h3>
            <p class="empty-desc">Catatan yang diarsipkan akan tampil di sini.</p>
        </div>
      `;
    }

    const activeFragment = document.createDocumentFragment();
    this._activeNotes.forEach((note) => {
      const noteItem = document.createElement("note-item");
      noteItem.setAttribute("data-id", note.id);
      noteItem.setAttribute("data-title", note.title);
      noteItem.setAttribute("data-body", note.body);
      noteItem.setAttribute("data-date", this.formatDate(note.createdAt));
      if (note.archived) {
        noteItem.setAttribute("archived", "");
      } else {
        noteItem.removeAttribute("archived");
      }
      activeFragment.appendChild(noteItem);
    });
    if (this._activeNotes.length > 0) {
      activeGrid.appendChild(activeFragment);
    }

    const archivedFragment = document.createDocumentFragment();
    this._archivedNotes.forEach((note) => {
      const noteItem = document.createElement("note-item");
      noteItem.setAttribute("data-id", note.id);
      noteItem.setAttribute("data-title", note.title);
      noteItem.setAttribute("data-body", note.body);
      noteItem.setAttribute("data-date", this.formatDate(note.createdAt));
      noteItem.setAttribute("archived", "");
      archivedFragment.appendChild(noteItem);
    });
    if (this._archivedNotes.length > 0) {
      archivedGrid.appendChild(archivedFragment);
    }
  }

  formatDate(isoString) {
    const date = new Date(isoString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("id-ID", options);
  }
}

customElements.define("note-list", NoteList);
