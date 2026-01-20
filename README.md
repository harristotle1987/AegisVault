# 📜 Sovereign Vault: Markdown Converter

### Where Modern Sovereignty Meets Timeless Elegance.

Sovereign Vault is a high-performance, **zero-latency** Markdown-to-Document converter. Built with a "Privacy-First" hardened architecture, this tool ensures that your data never leaves your browser. No AI processing, no cloud storage, and no third-party APIs.

## 🛠 Technical Architecture (Lean & Hardened)

This project is engineered as a **Single-Direction Transformation Pipeline**, operating entirely within the client-side execution context.

* **Logic Layer:** Pure TypeScript Regex-based refinement (No external LLM calls).
* **UI/UX:** High-Contrast "Obsidian" Aesthetic using Tailwind CSS.
* **Typography:** Base64-embedded Virtual File System (VFS) for Inter and JetBrains Mono.
* **Persistence:** Local-only storage via `IndexedDB` (No database overhead).
* **Binary Engine:** Client-side `jsPDF` and `docx` generation.

---

## 💎 Key Features

### 1. The Obsidian Workspace

A split-pane, high-contrast environment designed for focus.

* **Deep Space Palette:** Backgrounds at `#050505` to reduce eye strain.
* **Real-time Preview:** Instantaneous rendering of GitHub Flavored Markdown (GFM).

### 2. Local "AI" Refinement Logic

Instead of sending text to a server, the **VaultRefiner** class uses structural intelligence to:

* Standardize vertical rhythm and executive spacing.
* Apply "Smart Typography" (curly quotes, em-dashes, ellipses).
* Auto-suggest filenames based on Document H1 headers.

### 3. White-Glove Export Sequence

Finalize documents with professional precision.

* **Custom PDF Engine:** Injects dark-mode CSS to preserve the Obsidian vibe in the final file.
* **Docx Mapping:** Direct XML mapping of Markdown tokens to native Microsoft Word elements.
* **Renaming Logic:** A secure intercept modal to sanitize and define filenames before download.

---

## 🔒 Privacy Manifesto

> **Absolute Privacy is not a feature; it is the foundation.**

1. **Zero External Calls:** No Google Analytics, no AI APIs, no telemetry.
2. **Volatile Processing:** Documents are refined and converted in browser RAM.
3. **Local Sovereignty:** You own the fonts, the logic, and the data.
