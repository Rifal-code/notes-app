"use strict";

function formatDate(isoString) {
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

function generateId() {
  return `notes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
}

function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "class") {
      element.className = value;
    } else if (key === "dataset") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });

  return element;
}

function dispatchCustomEvent(element, eventName, detail) {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: detail,
  });
  element.dispatchEvent(event);
}

export {
  formatDate,
  generateId,
  truncateText,
  createElement,
  dispatchCustomEvent,
};
