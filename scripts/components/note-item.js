"use strict";

class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["data-id", "archived", "busy"];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (
      (name === "data-id" || name === "archived" || name === "busy") &&
      oldValue !== newValue
    ) {
      this.render();
      this.setupEventListeners();
    }
  }

  get noteId() {
    return this.getAttribute("data-id");
  }

  get noteTitle() {
    return this.getAttribute("data-title") || "";
  }

  get noteBody() {
    return this.getAttribute("data-body") || "";
  }

  get noteDate() {
    return this.getAttribute("data-date") || "";
  }

  get isArchived() {
    return this.hasAttribute("archived");
  }

  get isBusy() {
    return this.hasAttribute("busy");
  }

  setupEventListeners() {
    const archiveBtn = this.shadowRoot.querySelector(
      ".archive-btn, .unarchive-btn",
    );
    const deleteBtn = this.shadowRoot.querySelector(".delete-btn");

    if (archiveBtn) {
      archiveBtn.addEventListener("click", () => {
        if (!this.isBusy) {
          this.dispatchArchiveEvent();
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (!this.isBusy) {
          this.dispatchDeleteEvent();
        }
      });
    }
  }

  dispatchArchiveEvent() {
    const event = new CustomEvent("note:archive", {
      bubbles: true,
      composed: true,
      detail: {
        id: this.noteId,
      },
    });
    this.dispatchEvent(event);
  }

  dispatchDeleteEvent() {
    const event = new CustomEvent("note:delete", {
      bubbles: true,
      composed: true,
      detail: {
        id: this.noteId,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const archiveLabel = this.isArchived ? "Batal Arsip" : "Arsip";
    const archiveAria = this.isArchived ? "Batal arsipkan" : "Arsipkan";

    const archiveContent = this.isBusy
      ? `<span class="btn-content"><span class="spinner" aria-hidden="true"></span><span>Memproses...</span></span>`
      : archiveLabel;

    const deleteContent = this.isBusy
      ? `<span class="btn-content"><span class="spinner" aria-hidden="true"></span><span>Memproses...</span></span>`
      : "Hapus";

    const template = `
            <style>
                :host {
                    display: block;
                }
                .note-card {
                    background: var(--surface-color, #ffffff);
                    border-radius: var(--border-radius, 8px);
                    padding: var(--spacing-md, 16px);
                    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
                    transition: box-shadow var(--transition-normal, 0.3s ease);
                    display: flex;
                    flex-direction: column;                    
                }
                .note-card:hover {
                    box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
                }
                .note-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: var(--spacing-sm, 8px);
                    color: var(--text-primary, #212529);
                }
                .note-body {
                    font-size: 0.875rem;
                    color: var(--text-secondary, #6c757d);
                    margin-bottom: var(--spacing-md, 16px);
                    flex-grow: 1;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                }
                .note-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: var(--spacing-sm, 8px);
                    border-top: 1px solid var(--border-color, #dee2e6);
                }
                .note-date {
                    font-size: 0.75rem;
                    color: var(--text-secondary, #6c757d);
                }
                .note-actions {
                    display: flex;
                    gap: var(--spacing-xs, 4px);
                }
                .action-btn {
                    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
                    border: none;
                    border-radius: var(--border-radius-sm, 4px);
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: background var(--transition-fast, 0.15s ease);
                }
                .btn-content {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .spinner {
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(0, 0, 0, 0.25);
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
                .archive-btn {
                    background: var(--warning-color, #ffc107);
                    color: var(--text-primary, #212529);
                }
                .archive-btn:hover {
                    background: #e0a800;
                }
                .unarchive-btn {
                    background: var(--success-color, #28a745);
                    color: white;
                }
                .unarchive-btn:hover {
                    background: #218838;
                }
                .delete-btn {
                    background: var(--danger-color, #dc3545);
                    color: white;
                }
                .delete-btn:hover {
                    background: #c82333;
                }
                .action-btn:disabled {
                    opacity: 0.6;
                    cursor: wait;
                }
                .archived-badge {
                    display: none;
                    background: var(--secondary-color, #6c757d);
                    color: white;
                    padding: 2px 8px;
                    border-radius: var(--border-radius-sm, 4px);
                    font-size: 0.75rem;
                    margin-bottom: var(--spacing-sm, 8px);
                }
                :host([archived]) .archived-badge {
                    display: inline-block;
                }
            </style>
            <article class="note-card" aria-busy="${this.isBusy ? "true" : "false"}">
                <span class="archived-badge">Diarsipkan</span>
                <h3 class="note-title">${this.noteTitle}</h3>
                <p class="note-body">${this.noteBody}</p>
                <div class="note-footer">
                    <time class="note-date">${this.noteDate}</time>
                    <div class="note-actions">
                        <button class="action-btn ${this.isArchived ? "unarchive-btn" : "archive-btn"}" aria-label="${archiveAria} catatan" ${this.isBusy ? "disabled" : ""}>
                            ${archiveContent}
                        </button>
                        <button class="action-btn delete-btn" aria-label="Hapus catatan" ${this.isBusy ? "disabled" : ""}>
                            ${deleteContent}
                        </button>
                    </div>
                </div>
            </article>
        `;
    this.shadowRoot.innerHTML = template;
  }
}

customElements.define("note-item", NoteItem);
