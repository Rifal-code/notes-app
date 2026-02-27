"use strict";

class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._isSubmitting = false;
    this._formData = {
      title: "",
      body: "",
    };
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.shadowRoot.getElementById("note-form");
    const titleInput = this.shadowRoot.getElementById("title-input");
    const bodyInput = this.shadowRoot.getElementById("body-input");

    titleInput.addEventListener("input", (e) => {
      this._formData.title = e.target.value;
      const validation = this.validateTitle();
      this.validateForm();
      this.toggleError("title", !validation.valid, validation.message);
    });

    bodyInput.addEventListener("input", (e) => {
      this._formData.body = e.target.value;
      const validation = this.validateBody();
      this.validateForm();
      this.toggleError("body", !validation.valid, validation.message);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this._isSubmitting) {
        return;
      }

      if (this.validateForm()) {
        this.dispatchNoteAddEvent();
      }
    });
  }

  validateTitle() {
    const title = this._formData.title.trim();
    if (title.length === 0) {
      return { valid: false, message: "Judul tidak boleh kosong" };
    }
    if (title.length < 3) {
      return { valid: false, message: "Judul minimal 3 karakter" };
    }
    return { valid: true, message: "" };
  }

  validateBody() {
    const body = this._formData.body.trim();
    if (body.length === 0) {
      return { valid: false, message: "Isi catatan tidak boleh kosong" };
    }
    if (body.length < 5) {
      return { valid: false, message: "Isi catatan minimal 5 karakter" };
    }
    return { valid: true, message: "" };
  }

  validateForm() {
    const titleValidation = this.validateTitle();
    const bodyValidation = this.validateBody();
    const isValid = titleValidation.valid && bodyValidation.valid;
    const submitBtn = this.shadowRoot.getElementById("submit-btn");

    submitBtn.disabled = !isValid || this._isSubmitting;
    return isValid;
  }

  setSubmitting(isSubmitting) {
    const titleInput = this.shadowRoot.getElementById("title-input");
    const bodyInput = this.shadowRoot.getElementById("body-input");
    const submitBtn = this.shadowRoot.getElementById("submit-btn");

    this._isSubmitting = isSubmitting;
    titleInput.disabled = isSubmitting;
    bodyInput.disabled = isSubmitting;
    submitBtn.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    submitBtn.innerHTML = isSubmitting
      ? `<span class="btn-content"><span class="spinner" aria-hidden="true"></span><span>Menyimpan...</span></span>`
      : "Simpan Catatan";
    this.validateForm();
  }

  notifyAddSuccess() {
    this.resetForm();
  }

  toggleError(field, show, message) {
    const input = this.shadowRoot.getElementById(`${field}-input`);
    const error = this.shadowRoot.getElementById(`${field}-error`);

    if (show) {
      input.classList.add("invalid");
      error.classList.add("visible");
      error.textContent = message;
    } else {
      input.classList.remove("invalid");
      error.classList.remove("visible");
      error.textContent = "";
    }
  }

  dispatchNoteAddEvent() {
    const event = new CustomEvent("note:add", {
      bubbles: true,
      composed: true,
      detail: {
        title: this._formData.title.trim(),
        body: this._formData.body.trim(),
      },
    });
    this.dispatchEvent(event);
  }

  resetForm() {
    const titleInput = this.shadowRoot.getElementById("title-input");
    const bodyInput = this.shadowRoot.getElementById("body-input");

    titleInput.value = "";
    bodyInput.value = "";
    this._formData = { title: "", body: "" };
    this.validateForm();
  }

  render() {
    const template = `
            <style>
                :host {
                    display: block;
                }
                .form-container {
                    background: var(--surface-color, #ffffff);
                    padding: var(--spacing-lg, 24px);
                    border-radius: var(--border-radius, 8px);
                    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
                }
                .form-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: var(--spacing-md, 16px);
                    color: var(--text-primary, #212529);
                }
                .form-group {
                    margin-bottom: var(--spacing-md, 16px);
                }
                label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: var(--spacing-xs, 4px);
                    color: var(--text-primary, #212529);
                }
                input, textarea {
                    width: 100%;
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    border: 2px solid var(--border-color, #dee2e6);
                    border-radius: var(--border-radius-sm, 4px);
                    font-size: 1rem;
                    transition: border-color var(--transition-fast, 0.15s ease);
                    box-sizing: border-box;
                }
                input:focus, textarea:focus {
                    border-color: var(--primary-color, #4a90d9);
                    outline: none;
                }
                input.invalid, textarea.invalid {
                    border-color: var(--danger-color, #dc3545);
                }
                textarea {
                    min-height: 120px;
                    resize: vertical;
                    font-family: inherit;
                }
                .error-message {
                    color: var(--danger-color, #dc3545);
                    font-size: 0.875rem;
                    margin-top: var(--spacing-xs, 4px);
                    display: none;
                }
                .error-message.visible {
                    display: block;
                }
                button {
                    width: 100%;
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background: var(--primary-color, #4a90d9);
                    color: white;
                    border: none;
                    border-radius: var(--border-radius-sm, 4px);
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background var(--transition-fast, 0.15s ease);
                }
                .btn-content {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.35);
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
                button:hover:not(:disabled) {
                    background: var(--primary-hover, #357abd);
                }
                button:disabled {
                    background: var(--secondary-color, #6c757d);
                    cursor: not-allowed;
                    opacity: 0.7;
                }
            </style>
            <div class="form-container">
                <h2 class="form-title">Tambah Catatan Baru</h2>
                <form id="note-form">
                    <div class="form-group">
                        <label for="title-input">Judul</label>
                        <input 
                            type="text" 
                            id="title-input" 
                            name="title" 
                            placeholder="Masukkan judul catatan"
                            required
                            maxlength="50"
                            aria-required="true"
                        >
                        <p class="error-message" id="title-error">Judul tidak boleh kosong</p>
                    </div>
                    <div class="form-group">
                        <label for="body-input">Isi Catatan</label>
                        <textarea 
                            id="body-input" 
                            name="body" 
                            placeholder="Masukkan isi catatan"
                            required
                            aria-required="true"
                        ></textarea>
                        <p class="error-message" id="body-error">Isi catatan tidak boleh kosong</p>
                    </div>
                    <button type="submit" id="submit-btn" disabled>Simpan Catatan</button>
                </form>
            </div>
        `;
    this.shadowRoot.innerHTML = template;
  }
}

customElements.define("note-form", NoteForm);
