# 📑 Public Build Formatter (Project 01)

A reactive, dark-mode single-page text processing utility designed for developers to instantly structure messy, unformatted technical updates into clean, presentation-ready formats.

This project is built under strict resource constraints to master foundational DOM manipulation, client-side data streams, and rapid UI prototyping.

---

## ⚡ Core Features

*   **Reactive Split-Pane Workspace:** Dual-column grid interface providing real-time text input rendering with instant state feedback.
*   **Shorthand Parser Engine:** Local client-side string processing using optimized regular expression rules to instantly convert raw developer symbols (`#`, `##`, `*`) into structured UI elements.
*   **One-Click Clipboard Integration:** Seamless operations allowing builders to copy transformed code outputs instantly with visual success confirmations.
*   **Zero-Overhead Tailwind Layout:** Built using highly responsive Utility-First CSS components running entirely on a zero-installation CDN pipeline.

---

## 📂 Project Architecture

```text
project01-markdown-formatter/
│
├── README.md         # This project documentation
├── index.html        # Split-pane interface layout & CDN tracking
├── style.css         # Custom typographic formatting overrides
└── script.js         # Reactive input stream handlers & parsing logic
```

---

## 🛠️ Local Implementation

You can launch this standalone component natively from your terminal workspace:

1. Navigate directly to this project folder:
   ```bash
   cd project01-markdown-formatter
   ```
2. Spin up a lightweight local development port using Python's built-in hosting utility:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and view the application workspace interface live at:
   ```text
   http://localhost:8000
   ```

---

## 🚀 Next Milestone: The AI Transformation (Day 2)

The current implementation relies on rigid text-symbol matches. The upcoming milestone will replace the local regex function with a dynamic connection module linking to a **free Google Gemini API model** to handle natural, unstructured developer logs automatically.
