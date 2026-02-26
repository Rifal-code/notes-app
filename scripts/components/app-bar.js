"use strict";

class AppBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ["app-title"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  get appTitle() {
    return this.getAttribute("app-title") || "Notes App";
  }

  render() {
    const template = `
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
                <h1 class="app-title">${this.appTitle}</h1>
            </div>
        `;
    this.shadowRoot.innerHTML = template;
  }
}

customElements.define("app-bar", AppBar);
