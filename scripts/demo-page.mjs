// Turns dist-demo/index.html into a page body (no <html>/<head>/<body>),
// the format the Claude artifact host expects. Output: dist-demo/bamboo-demo.html
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist-demo/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<link rel="(icon|apple-touch-icon)"[^>]*>/g, '');
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
// The host doesn't put data-theme on <html> by default; default to the app's dark theme.
const theme = `<script>if(!document.documentElement.hasAttribute('data-theme'))document.documentElement.setAttribute('data-theme','dark');document.documentElement.lang='fa';document.documentElement.dir='rtl';</script>`;
writeFileSync('dist-demo/bamboo-demo.html', head.trim() + '\n' + theme + '\n' + body.trim() + '\n');
console.log('dist-demo/bamboo-demo.html', (Buffer.byteLength(head + body) / 1024).toFixed(0) + ' KB');
