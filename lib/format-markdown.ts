/**
 * Convert basic markdown to HTML for rendering AI responses.
 * Handles headings, bold, italic, lists, and paragraphs.
 */
export function formatMessage(text: string): string {
  // First pass: inline formatting
  let html = text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Wrap consecutive `- ` lines in <ul>
  html = html.replace(/(^- .+$(\n^- .+$)*)/gm, (match) => {
    const items = match
      .split("\n")
      .map((line) => `<li>${line.replace(/^- /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Wrap consecutive `N. ` lines in <ol>
  html = html.replace(/(^\d+\. .+$(\n^\d+\. .+$)*)/gm, (match) => {
    const items = match
      .split("\n")
      .map((line) => `<li>${line.replace(/^\d+\. /, "")}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs and line breaks
  html = html
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");

  return html;
}
