"use strict";

class NoteList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  get notes() {
    return this._notes || [];
  }

  set notes(value) {
    this._notes = value;
    this.renderNotes();
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
                    gap: var(--spacing-md, 16px);
                }
                @media (max-width: 600px) {
                    .notes-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            <div class="notes-grid" id="notes-grid"></div>
        `;
    this.shadowRoot.innerHTML = template;
  }

  renderNotes() {
    const grid = this.shadowRoot.getElementById("notes-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (this.notes.length === 0) {
      grid.innerHTML = `
        <div class="empty-container" style="grid-column: 1 / -1; text-align: center; padding: 32px;">
            <div style="font-size: 4rem; margin-bottom: 16px; opacity: 0.5;">📝</div>
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">Belum Ada Catatan</h3>
            <p style="font-size: 1rem; color: #6c757d;">Tambahkan catatan pertama Anda!</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    this.notes.forEach((note) => {
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
      fragment.appendChild(noteItem);
    });

    grid.appendChild(fragment);
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
