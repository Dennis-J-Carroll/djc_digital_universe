const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const mammoth = require('mammoth');
const TurndownService = require('turndown');
const slugify = require('slugify');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const turndownService = new TurndownService();

async function run() {
  console.log('\n🤖 DJC Digital Universe - Content Importer');
  console.log('============================================');
  
  try {
    const filePath = await rl.question('Enter the path to your file (.docx, .md, .txt): ');
    
    // Clean up path (handle quotes if they drag-and-drop the file into the terminal)
    const cleanPath = filePath.trim().replace(/^['"]|['"]$/g, '');
    const absPath = path.resolve(cleanPath);
    
    if (!fs.existsSync(absPath)) {
      console.log(`\n❌ Error: File not found at ${absPath}`);
      return process.exit(1);
    }

    // Support DOCX, fallback to standard text reading.
    const ext = path.extname(absPath).toLowerCase();
    if (ext === '.doc') {
      console.log('\n❌ Error: Older .doc format is not supported. Please save as .docx or .md first.');
      return process.exit(1);
    }

    const typeSelection = await rl.question('\nWhat kind of content is this?\n  1) Story\n  2) Blog Post\n  3) Research/Data Project\nChoose (1/2/3): ');
    let typeDir = 'src/stories';
    let category = 'stories';
    if (typeSelection.trim() === '2') { typeDir = 'src/blog-posts'; category = 'blog'; }
    if (typeSelection.trim() === '3') { typeDir = 'src/data-science-projects'; category = 'research'; }

    const title = await rl.question('\nEnter the Title: ');
    const description = await rl.question('Enter a short description for SEO: ');
    
    /* Optional enhancements like Author or Genre could go here */

    // Generate Metadata
    const slug = slugify(title, { lower: true, strict: true });
    const date = new Date().toISOString().split('T')[0];
    
    console.log('\nProcessing file...');
    let content = '';
    
    if (ext === '.docx') {
      // Extract from DOCX and convert HTML to MD
      // Mammoth reliably recovers headings, paragraphs, lists, and bold/italics
      const result = await mammoth.convertToHtml({ path: absPath });
      content = turndownService.turndown(result.value);
    } else {
      // Read raw text or markdown
      content = fs.readFileSync(absPath, 'utf8');
    }

    // Construct standard Gatsby MDX Frontmatter
    const mdxPreamble = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
slug: "${slug}"
category: "${category}"
published: true
description: "${description.replace(/"/g, '\\"')}"
---

`;

    // Only prepend a title header if the document didn't naturally start with one
    let finalContent = mdxPreamble;
    if (!content.trim().startsWith('# ')) {
      finalContent += `# ${title}\n\n`;
    }
    finalContent += content;
    
    // Create Directory & File
    const targetDir = path.join(process.cwd(), typeDir, slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetFile = path.join(targetDir, 'index.mdx');
    fs.writeFileSync(targetFile, finalContent);

    console.log('\n✅ Success!');
    console.log(`Content imported gracefully to: ${targetFile}`);
    console.log(`Run 'npm run develop' to preview it locally!\n`);
    
  } catch (err) {
    console.error('\n❌ An error occurred:', err);
  } finally {
    rl.close();
  }
}

run();
