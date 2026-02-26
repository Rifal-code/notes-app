"use strict";

const templates = {
  appBar: `
        <style>
            :host {
                display: block;
                background: var(--primary-color, #4a90d9);
                color: white;
                padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
                box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
            }
            .app-bar {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .app-title {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0;
            }
            @media (max-width: 600px) {
                .app-title {
                    font-size: 1.25rem;
                }
            }
        </style>
        <div class="app-bar">
            <h1 class="app-title"><slot name="title">Notes App</slot></h1>
        </div>
    `,

  noteForm: `
        <style>
            :host {
                display: block;
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
            button:hover:not(:disabled) {
                background: var(--primary-hover, #357abd);
            }
            button:disabled {
                background: var(--secondary-color, #6c757d);
                cursor: not-allowed;
                opacity: 0.7;
            }
        </style>
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
    `,

  noteItem: `
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
                height: 100%;
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
            .archive-btn {
                background: var(--warning-color, #ffc107);
                color: var(--text-primary, #212529);
            }
            .archive-btn:hover {
                background: #e0a800;
            }
            .delete-btn {
                background: var(--danger-color, #dc3545);
                color: white;
            }
            .delete-btn:hover {
                background: #c82333;
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
            :host([archived="true"]) .archived-badge {
                display: inline-block;
            }
        </style>
        <article class="note-card">
            <span class="archived-badge">Diarsipkan</span>
            <h3 class="note-title"></h3>
            <p class="note-body"></p>
            <div class="note-footer">
                <time class="note-date"></time>
                <div class="note-actions">
                    <button class="action-btn archive-btn" aria-label="Arsipkan catatan">Arsip</button>
                    <button class="action-btn delete-btn" aria-label="Hapus catatan">Hapus</button>
                </div>
            </div>
        </article>
    `,

  noteList: `
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
        <div class="notes-grid"></div>
    `,

  emptyState: `
        <style>
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px;
                padding: var(--spacing-xl, 32px);
            }
            .empty-container {
                text-align: center;
            }
            .empty-icon {
                font-size: 4rem;
                margin-bottom: var(--spacing-md, 16px);
                opacity: 0.5;
            }
            .empty-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-primary, #212529);
                margin-bottom: var(--spacing-sm, 8px);
            }
            .empty-message {
                font-size: 1rem;
                color: var(--text-secondary, #6c757d);
            }
        </style>
        <div class="empty-container">
            <div class="empty-icon">📝</div>
            <h3 class="empty-title">Belum Ada Catatan</h3>
            <p class="empty-message">Tambahkan catatan pertama Anda!</p>
        </div>
    `,
};

export default templates;
