// DOM Element Targets
const markdownInput = document.getElementById("markdownInput");
const markdownPreview = document.getElementById("markdownPreview");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

// Reactive Real-Time Input Processing
markdownInput.addEventListener("input", (e) => {
  const rawText = e.target.value;

  if (rawText.trim() === "") {
    markdownPreview.innerHTML = `<span class="text-gray-600 italic">Structured formatting output will render here automatically...</span>`;
    return;
  }

  // Pass value to processing helper
  markdownPreview.innerHTML = parseBasicMarkdown(rawText);
});

// A lightweight, client-side regex parsing function for custom text transformation
function parseBasicMarkdown(text) {
  let html = text;

  // 1. Sanitize simple HTML string behaviors to prevent breaking layouts
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Process custom shorthand patterns (e.g., lines starting with '# ' convert to Headings)
  html = html.replace(/^#\s+(.*)\$/dgm, "<h1>$1</h1>");
  html = html.replace(/^##\s+(.*)\$/dgm, "<h2>$2</h2>");

  // 3. Simple bullet points fallback logic
  html = html.replace(/^\*\s+(.*)\$/dgm, "<li>$1</li>");

  // Convert breaks to functional spacing elements
  return html.replace(/\n/g, "<br>");
}

// Global Operations
clearBtn.addEventListener("click", () => {
  markdownInput.value = "";
  markdownPreview.innerHTML = `<span class="text-gray-600 italic">Structured formatting output will render here automatically...</span>`;
});

copyBtn.addEventListener("click", () => {
  if (!markdownInput.value.trim()) return;
  navigator.clipboard.writeText(markdownInput.value);

  // Quick UI button click confirmation behavior
  const standardText = copyBtn.innerText;
  copyBtn.innerText = "Copied! 🎉";
  copyBtn.classList.replace("bg-indigo-600", "bg-emerald-600");

  setTimeout(() => {
    copyBtn.innerText = standardText;
    copyBtn.classList.replace("bg-emerald-600", "bg-indigo-600");
  }, 1500);
});
