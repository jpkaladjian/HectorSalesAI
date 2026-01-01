import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read markdown file
const mdPath = path.join(__dirname, '../docs/HECTOR_DOCUMENTATION_COMPLETE_2025.md');
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Convert markdown to HTML with styling
function markdownToHTML(md) {
  let html = md
    // Headers
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Tables
    .replace(/\|(.+)\|\n\|[-:\| ]+\|\n((?:\|.+\|\n?)*)/g, function(match, header, rows) {
      const headers = header.split('|').filter(h => h.trim()).map(h => `<th>${h.trim()}</th>`).join('');
      const rowsHTML = rows.split('\n').filter(r => r.trim()).map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('\n');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rowsHTML}</tbody></table>`;
    })
    
    // Checkmarks and crosses
    .replace(/✅/g, '<span style="color: #22C55E;">✅</span>')
    .replace(/❌/g, '<span style="color: #EF4444;">❌</span>')
    .replace(/⚠️/g, '<span style="color: #F59E0B;">⚠️</span>')
    
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|p|pre|table|ul|ol])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>');
  
  return html;
}

const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hector - Documentation Complète 2025</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 20mm 15mm;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    
    h1 {
      color: #1E40AF;
      font-size: 24pt;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 10px;
      margin: 40px 0 20px 0;
      page-break-before: always;
    }
    
    h1:first-of-type {
      page-break-before: auto;
      text-align: center;
      border-bottom: none;
      font-size: 32pt;
      margin-top: 100px;
    }
    
    h2 {
      color: #3B82F6;
      font-size: 18pt;
      margin: 30px 0 15px 0;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 5px;
    }
    
    h3 {
      color: #1F2937;
      font-size: 14pt;
      margin: 20px 0 10px 0;
    }
    
    h4 {
      color: #374151;
      font-size: 12pt;
      margin: 15px 0 8px 0;
    }
    
    p {
      margin: 10px 0;
      text-align: justify;
    }
    
    code {
      background: #F3F4F6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 9pt;
      color: #1F2937;
    }
    
    pre {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 5px;
      padding: 15px;
      overflow-x: auto;
      font-size: 8pt;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    
    pre code {
      background: none;
      padding: 0;
      font-size: 8pt;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    
    th {
      background: #3B82F6;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #2563EB;
    }
    
    td {
      border: 1px solid #E5E7EB;
      padding: 8px;
    }
    
    tr:nth-child(even) {
      background: #F9FAFB;
    }
    
    a {
      color: #3B82F6;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    strong {
      font-weight: bold;
      color: #1F2937;
    }
    
    ul, ol {
      margin: 10px 0 10px 25px;
    }
    
    li {
      margin: 5px 0;
    }
    
    .cover-page {
      text-align: center;
      padding-top: 200px;
    }
    
    .cover-page h1 {
      margin-top: 0;
      font-size: 36pt;
      border-bottom: none;
    }
    
    .cover-page .subtitle {
      font-size: 18pt;
      color: #6B7280;
      margin: 20px 0;
    }
    
    .cover-page .company {
      font-size: 14pt;
      color: #1F2937;
      font-weight: bold;
      margin: 30px 0;
    }
    
    .cover-page .meta {
      font-size: 11pt;
      color: #6B7280;
      margin-top: 50px;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    hr {
      border: none;
      border-top: 2px solid #E5E7EB;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  ${markdownToHTML(mdContent)}
</body>
</html>
`;

// Write HTML file
const htmlPath = path.join(__dirname, '../docs/HECTOR_DOCUMENTATION_COMPLETE_2025.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

console.log('✅ HTML généré:', htmlPath);
console.log('\nPour générer le PDF:');
console.log('1. Ouvre le fichier HTML dans Chrome/Firefox');
console.log('2. Imprimer → Enregistrer au format PDF');
console.log('3. Ou utilise wkhtmltopdf si disponible');
