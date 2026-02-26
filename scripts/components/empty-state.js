"use strict";

class EmptyState extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const template = `
            <style>
                :host {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 200px;
                    padding: var(--spacing-xl, 32px);
                    grid-column: 1 / -1;
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
        `;
    this.shadowRoot.innerHTML = template;
  }
}

customElements.define("empty-state", EmptyState);
