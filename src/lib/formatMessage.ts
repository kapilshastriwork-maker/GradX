export function formatMessage(content: string): string {
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^• (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  
  formatted = formatted.replace(/<li>.*<\/li>/g, (match) => {
    return '<ul class="list-disc pl-4 space-y-1">' + match + "</ul>";
  });
  
  return "<p>" + formatted + "</p>";
}