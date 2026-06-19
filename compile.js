const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

try {
  // Read source files
  console.log('Reading files...');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const indexCss = fs.readFileSync(path.join(rootDir, 'index.css'), 'utf8');
  const trackerJs = fs.readFileSync(path.join(rootDir, 'tracker.js'), 'utf8');
  const chatbotJs = fs.readFileSync(path.join(rootDir, 'chatbot.js'), 'utf8');
  let indexJs = fs.readFileSync(path.join(rootDir, 'index.js'), 'utf8');

  // Comment out dynamic chatbot loading in the inline index.js script
  indexJs = indexJs.replace(
    /const\\s+chatbotScript\\s*=\\s*document\\.createElement\\('script'\\);[\\s\\S]*?document\\.body\\.appendChild\\(chatbotScript\\);/g,
    '// Dynamic chatbot script loading removed as chatbot.js is inline'
  );
  // Also handle exact string replacement in case the regex doesn't match due to formatting
  const dynamicLoaderStr = `  const chatbotScript = document.createElement('script');\n  chatbotScript.src = 'chatbot.js';\n  document.body.appendChild(chatbotScript);`;
  if (indexJs.includes(dynamicLoaderStr)) {
    indexJs = indexJs.replace(dynamicLoaderStr, '  // Chatbot logic is loaded inline directly inside quote-widget.html');
  }

  // Replace index.css reference with inline style
  console.log('Inlining CSS...');
  let compiledHtml = indexHtml.replace(
    '<link rel="stylesheet" href="index.css">',
    `<style>\n${indexCss}\n</style>`
  );

  // Replace external scripts with inline scripts at the bottom
  console.log('Inlining JavaScript...');
  const scriptsToInline = `
  <!-- 1. Web Analytics Tracker (tracker.js) -->
  <script>
  ${trackerJs}
  </script>

  <!-- 2. Rebranded Chat Assistant: LogiBot (chatbot.js) -->
  <script>
  ${chatbotJs}
  </script>

  <!-- 3. Page Controller & Cost Estimator (index.js) -->
  <script>
  ${indexJs}
  </script>
`;

  compiledHtml = compiledHtml.replace(
    /<script\s+src="tracker\.js"><\/script>\s*<script\s+src="index\.js"><\/script>/,
    scriptsToInline
  );

  // Write out combined widget HTML
  console.log('Writing quote-widget.html...');
  fs.writeFileSync(path.join(rootDir, 'quote-widget.html'), compiledHtml, 'utf8');
  console.log('Compilation completed successfully!');

} catch (err) {
  console.error('Error during compilation:', err);
  process.exit(1);
}
